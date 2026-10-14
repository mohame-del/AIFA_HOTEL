import { nightsBetween, todayISO } from "./dates";
import { createSeed } from "./seed";
import type { Feedback, FeedbackStatus, HotelState, Reservation, Role } from "./types";

export const ACTIVE_STATUSES = ["Confirmed", "Expected Arrival", "Checked In"] as const;

export interface NewReservationInput {
  guestName: string;
  roomNumber: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string | undefined;
}

// Half-open interval comparison: a stay ending on the day another begins is not
// a conflict (check-out day is free for the next arrival).
export function datesOverlap(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

export function findConflict(
  state: HotelState,
  input: Pick<NewReservationInput, "roomNumber" | "checkIn" | "checkOut">,
) {
  return state.reservations.find(
    (r) =>
      r.roomNumber === input.roomNumber &&
      (ACTIVE_STATUSES as readonly string[]).includes(r.status) &&
      datesOverlap(input.checkIn, input.checkOut, r.checkIn, r.checkOut),
  );
}

export function validateReservation(state: HotelState, input: NewReservationInput): string | null {
  if (!input.guestName.trim()) return "Please enter the guest name.";
  const room = state.rooms.find((r) => r.number === input.roomNumber);
  if (!room) return "Please choose a room between 1 and 90.";
  if (!input.checkIn || !input.checkOut) return "Please choose check-in and check-out dates.";
  if (input.checkIn < todayISO()) return "Check-in cannot be in the past.";
  if (nightsBetween(input.checkIn, input.checkOut) < 1)
    return "Check-out must be at least one night after check-in.";
  if (input.guests < 1 || input.guests > room.capacity)
    return `Room ${room.number} accommodates up to ${room.capacity} guests.`;
  if (room.status === "maintenance" && input.checkIn === todayISO())
    return `Room ${room.number} is out of service today.`;
  const c = findConflict(state, input);
  if (c)
    return `Room ${room.number} is already booked by ${c.guestName} (${c.id}) for overlapping dates.`;
  return null;
}

export function currentReservation(state: HotelState, roomNumber: number): Reservation | undefined {
  return state.reservations.find(
    (r) =>
      r.roomNumber === roomNumber && (r.status === "Checked In" || r.status === "Expected Arrival"),
  );
}

export type Action =
  | { type: "login"; role: Role }
  | { type: "logout" }
  | { type: "reset" }
  | { type: "createReservation"; input: NewReservationInput }
  | { type: "checkIn"; id: string }
  | { type: "checkOut"; id: string }
  | { type: "cancel"; id: string }
  | { type: "setMaintenance"; room: number; note: string }
  | { type: "setAvailable"; room: number }
  | {
      type: "addFeedback";
      feedback: Omit<Feedback, "id" | "createdAt" | "status">;
    }
  | { type: "feedbackStatus"; id: string; status: FeedbackStatus };

// Reference numbers continue the seeded sequence; fall back to 2400 so a state
// without reservations still starts at AIF-2401.
function nextRef(state: HotelState) {
  const max = state.reservations.reduce(
    (m, r) => Math.max(m, Number(r.id.split("-")[1]) || 0),
    2400,
  );
  return `AIF-${max + 1}`;
}

const setRoom = (state: HotelState, n: number, patch: Partial<HotelState["rooms"][number]>) =>
  state.rooms.map((r) => (r.number === n ? { ...r, ...patch } : r));

export function reducer(state: HotelState, action: Action): HotelState {
  switch (action.type) {
    case "login":
      return { ...state, role: action.role };
    case "logout":
      return { ...state, role: null };
    case "reset":
      return { ...createSeed(), role: state.role };
    case "createReservation": {
      if (validateReservation(state, action.input)) return state;
      // Same-day arrivals are treated as "Expected Arrival" and immediately hold
      // the room; future bookings stay "Confirmed" until the arrival day.
      const arrivesToday = action.input.checkIn === todayISO();
      const res: Reservation = {
        ...action.input,
        guestName: action.input.guestName.trim(),
        id: nextRef(state),
        status: arrivesToday ? "Expected Arrival" : "Confirmed",
        createdAt: new Date().toISOString(),
      };
      const room = state.rooms.find((r) => r.number === res.roomNumber);
      const rooms =
        arrivesToday && room?.status === "available"
          ? setRoom(state, res.roomNumber, { status: "reserved" })
          : state.rooms;
      return { ...state, rooms, reservations: [res, ...state.reservations] };
    }
    case "checkIn": {
      const res = state.reservations.find((r) => r.id === action.id);
      if (!res || (res.status !== "Expected Arrival" && res.status !== "Confirmed")) return state;
      return {
        ...state,
        rooms: setRoom(state, res.roomNumber, {
          status: "occupied",
          maintenanceNote: undefined,
        }),
        reservations: state.reservations.map((r) =>
          r.id === res.id ? { ...r, status: "Checked In" } : r,
        ),
      };
    }
    case "checkOut": {
      const res = state.reservations.find((r) => r.id === action.id);
      if (!res || res.status !== "Checked In") return state;
      return {
        ...state,
        rooms: setRoom(state, res.roomNumber, { status: "available" }),
        reservations: state.reservations.map((r) =>
          r.id === res.id ? { ...r, status: "Checked Out" } : r,
        ),
      };
    }
    case "cancel": {
      const res = state.reservations.find((r) => r.id === action.id);
      if (!res || res.status === "Checked In" || res.status === "Checked Out") return state;
      const room = state.rooms.find((r) => r.number === res.roomNumber);
      // Only a same-day (Expected Arrival) booking frees the room on cancel; a
      // future "Confirmed" booking never held it.
      const rooms =
        res.status === "Expected Arrival" && room?.status === "reserved"
          ? setRoom(state, res.roomNumber, { status: "available" })
          : state.rooms;
      return {
        ...state,
        rooms,
        reservations: state.reservations.map((r) =>
          r.id === res.id ? { ...r, status: "Cancelled" } : r,
        ),
      };
    }
    case "setMaintenance":
      return {
        ...state,
        rooms: setRoom(state, action.room, {
          status: "maintenance",
          maintenanceNote: action.note || "Out of service.",
        }),
      };
    case "setAvailable":
      return {
        ...state,
        rooms: setRoom(state, action.room, {
          status: "available",
          maintenanceNote: undefined,
        }),
      };
    case "addFeedback": {
      const fb: Feedback = {
        ...action.feedback,
        id: `FB-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: "New",
      };
      return { ...state, feedback: [fb, ...state.feedback] };
    }
    case "feedbackStatus":
      return {
        ...state,
        feedback: state.feedback.map((f) =>
          f.id === action.id ? { ...f, status: action.status } : f,
        ),
      };
  }
}

export function roomCounts(state: HotelState) {
  const c = { available: 0, occupied: 0, reserved: 0, maintenance: 0 };
  state.rooms.forEach((r) => c[r.status]++);
  return c;
}

export function averageRating(state: HotelState) {
  const rated = state.feedback.filter((f) => f.rating);
  if (!rated.length) return 0;
  return rated.reduce((s, f) => s + (f.rating ?? 0), 0) / rated.length;
}

export const isLowRating = (f: Feedback) => f.rating !== undefined && f.rating <= 3;
