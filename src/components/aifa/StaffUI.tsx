import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CalendarPlus, LogIn, LogOut, Wrench, CheckCircle2, XCircle, Eye } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useHotel } from "@/lib/hotel/store";
import { currentReservation, validateReservation } from "@/lib/hotel/logic";
import { addDays, fmtDate, nightsBetween, todayISO } from "@/lib/hotel/dates";
import { ResStatusBadge, RoomStatusBadge } from "./badges";

type Modal =
  | { kind: "reservation"; id: string }
  | { kind: "checkIn"; id: string }
  | { kind: "checkOut"; id: string }
  | { kind: "new"; room?: number | undefined }
  | { kind: "maintenance"; room: number }
  | { kind: "restore"; room: number }
  | null;

interface UI {
  openRoom: (n: number) => void;
  openReservation: (id: string) => void;
  openCheckIn: (id: string) => void;
  openCheckOut: (id: string) => void;
  openNew: (room?: number | undefined) => void;
}
const Ctx = createContext<UI | null>(null);
export const useStaffUI = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStaffUI outside provider");
  return v;
};

export function StaffUIProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<number | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const ui: UI = {
    openRoom: setRoom,
    openReservation: (id) => setModal({ kind: "reservation", id }),
    openCheckIn: (id) => setModal({ kind: "checkIn", id }),
    openCheckOut: (id) => setModal({ kind: "checkOut", id }),
    openNew: (r) => setModal({ kind: "new", room: r }),
  };
  const close = () => setModal(null);
  return (
    <Ctx.Provider value={ui}>
      {children}
      <RoomDrawer number={room} onClose={() => setRoom(null)} setModal={setModal} />
      {modal?.kind === "reservation" && (
        <ReservationDetails id={modal.id} onClose={close} setModal={setModal} />
      )}
      {modal?.kind === "checkIn" && <CheckInDialog id={modal.id} onClose={close} />}
      {modal?.kind === "checkOut" && <CheckOutDialog id={modal.id} onClose={close} />}
      {modal?.kind === "new" && <ReservationForm room={modal.room} onClose={close} />}
      {modal?.kind === "maintenance" && <MaintenanceDialog room={modal.room} onClose={close} />}
      {modal?.kind === "restore" && <RestoreDialog room={modal.room} onClose={close} />}
    </Ctx.Provider>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium text-foreground">{value}</span>
    </div>
  );
}

function RoomDrawer({
  number,
  onClose,
  setModal,
}: {
  number: number | null;
  onClose: () => void;
  setModal: (m: Modal) => void;
}) {
  const { state } = useHotel();
  const room = number ? state.rooms.find((r) => r.number === number) : undefined;
  const res = room ? currentReservation(state, room.number) : undefined;
  const upcoming = room
    ? state.reservations
        .filter((r) => r.roomNumber === room.number && r.status === "Confirmed")
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    : [];
  const go = (m: Modal) => {
    onClose();
    setModal(m);
  };
  return (
    <Sheet open={!!room} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border bg-card sm:max-w-md">
        {room && (
          <>
            <SheetHeader className="text-start">
              <p className="eyebrow">{room.type}</p>
              <SheetTitle className="font-display text-4xl font-medium">
                Room {room.number}
              </SheetTitle>
              <SheetDescription asChild>
                <div>
                  <RoomStatusBadge status={room.status} />
                </div>
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 rounded-md border border-border bg-background/50 px-4">
              <Row label="Room type" value={room.type} />
              <Row label="Capacity" value={`${room.capacity} guests`} />
              <Row label="Nightly rate (demo)" value={`${room.rate.toLocaleString("en-US")} DZD`} />
              {res && (
                <>
                  <Row label="Guest" value={res.guestName} />
                  <Row label="Reference" value={res.id} />
                  <Row label="Check-in" value={fmtDate(res.checkIn)} />
                  <Row label="Check-out" value={fmtDate(res.checkOut)} />
                  <Row label="Nights" value={nightsBetween(res.checkIn, res.checkOut)} />
                </>
              )}
              {room.status === "maintenance" && (
                <Row label="Maintenance" value={room.maintenanceNote} />
              )}
            </div>

            <div className="mt-6 grid gap-2">
              {room.status === "available" && (
                <>
                  <Button onClick={() => go({ kind: "new", room: room.number })}>
                    <CalendarPlus /> Create reservation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => go({ kind: "maintenance", room: room.number })}
                  >
                    <Wrench /> Mark out of service
                  </Button>
                </>
              )}
              {room.status === "reserved" && res && (
                <>
                  <Button onClick={() => go({ kind: "checkIn", id: res.id })}>
                    <LogIn /> Check in guest
                  </Button>
                  <Button variant="outline" onClick={() => go({ kind: "reservation", id: res.id })}>
                    <Eye /> View reservation
                  </Button>
                </>
              )}
              {room.status === "occupied" && res && (
                <>
                  <Button onClick={() => go({ kind: "checkOut", id: res.id })}>
                    <LogOut /> Check out guest
                  </Button>
                  <Button variant="outline" onClick={() => go({ kind: "reservation", id: res.id })}>
                    <Eye /> View guest details
                  </Button>
                </>
              )}
              {room.status === "maintenance" && (
                <Button onClick={() => go({ kind: "restore", room: room.number })}>
                  <CheckCircle2 /> Mark as available
                </Button>
              )}
            </div>

            {upcoming.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow mb-2">Upcoming bookings</p>
                <ul className="space-y-2">
                  {upcoming.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => go({ kind: "reservation", id: u.id })}
                        className="flex w-full items-center justify-between rounded-sm border border-border px-3 py-2 text-start text-sm transition-colors hover:border-primary/60"
                      >
                        <span>
                          {u.guestName}
                          <span className="block text-xs text-muted-foreground">
                            {fmtDate(u.checkIn)} → {fmtDate(u.checkOut)}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">{u.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function useRes(id: string) {
  const { state } = useHotel();
  return state.reservations.find((r) => r.id === id);
}

function ReservationDetails({
  id,
  onClose,
  setModal,
}: {
  id: string;
  onClose: () => void;
  setModal: (m: Modal) => void;
}) {
  const { dispatch, state } = useHotel();
  const res = useRes(id);
  if (!res) return null;
  const room = state.rooms.find((r) => r.number === res.roomNumber)!;
  const canCheckIn =
    res.status === "Expected Arrival" || (res.status === "Confirmed" && res.checkIn <= todayISO());
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <p className="eyebrow">Reservation {res.id}</p>
          <DialogTitle className="font-display text-3xl font-medium">{res.guestName}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <ResStatusBadge status={res.status} />
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border bg-background/50 px-4">
          <Row label="Room" value={`${res.roomNumber} · ${room.type}`} />
          <Row label="Guests" value={res.guests} />
          <Row label="Check-in" value={fmtDate(res.checkIn)} />
          <Row label="Check-out" value={fmtDate(res.checkOut)} />
          <Row label="Nights" value={nightsBetween(res.checkIn, res.checkOut)} />
          {res.notes && <Row label="Notes" value={res.notes} />}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {res.status === "Confirmed" || res.status === "Expected Arrival" ? (
            <Button
              variant="ghost"
              className="text-status-maintenance"
              onClick={() => {
                dispatch({ type: "cancel", id: res.id });
                toast.success(`Reservation ${res.id} cancelled`);
                onClose();
              }}
            >
              <XCircle /> Cancel reservation
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {canCheckIn && (
              <Button onClick={() => setModal({ kind: "checkIn", id: res.id })}>
                <LogIn /> Check in
              </Button>
            )}
            {res.status === "Checked In" && (
              <Button onClick={() => setModal({ kind: "checkOut", id: res.id })}>
                <LogOut /> Check out
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckInDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { dispatch, state } = useHotel();
  const res = useRes(id);
  if (!res) return null;
  const room = state.rooms.find((r) => r.number === res.roomNumber)!;
  const blocked = room.status === "occupied" || room.status === "maintenance";
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <p className="eyebrow">Check-in</p>
          <DialogTitle className="font-display text-3xl font-medium">
            Welcome {res.guestName}
          </DialogTitle>
          <DialogDescription>Confirm the room assignment to complete arrival.</DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border bg-background/50 px-4">
          <Row label="Reference" value={res.id} />
          <Row
            label="Assigned room"
            value={
              <span className="text-primary">
                Room {room.number} · {room.type}
              </span>
            }
          />
          <Row label="Stay" value={`${fmtDate(res.checkIn)} → ${fmtDate(res.checkOut)}`} />
          <Row label="Nights" value={nightsBetween(res.checkIn, res.checkOut)} />
          <Row label="Guests" value={res.guests} />
        </div>
        {blocked && (
          <p className="text-sm text-status-maintenance">
            Room {room.number} is currently{" "}
            {room.status === "occupied" ? "occupied" : "out of service"} and cannot be checked into.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={blocked}
            onClick={() => {
              dispatch({ type: "checkIn", id: res.id });
              toast.success(`${res.guestName} checked in to Room ${room.number}`);
              onClose();
            }}
          >
            <LogIn /> Confirm check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckOutDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { dispatch } = useHotel();
  const res = useRes(id);
  if (!res) return null;
  const early = res.checkOut > todayISO();
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <p className="eyebrow">Check-out</p>
          <DialogTitle className="font-display text-3xl font-medium">
            Farewell, {res.guestName}
          </DialogTitle>
          <DialogDescription>Review the summary before releasing the room.</DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-border bg-background/50 px-4">
          <Row label="Guest" value={res.guestName} />
          <Row label="Room" value={res.roomNumber} />
          <Row label="Arrived" value={fmtDate(res.checkIn)} />
          <Row label="Planned departure" value={fmtDate(res.checkOut)} />
          <Row label="Recorded departure" value={fmtDate(todayISO())} />
        </div>
        {early && (
          <p className="text-xs text-status-reserved">
            This guest is leaving before the planned departure date.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch({ type: "checkOut", id: res.id });
              toast.success(
                `${res.guestName} checked out · Room ${res.roomNumber} is now available`,
              );
              onClose();
            }}
          >
            <LogOut /> Confirm check-out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReservationForm({ room, onClose }: { room?: number | undefined; onClose: () => void }) {
  const { state, dispatch } = useHotel();
  const today = todayISO();
  const [f, setF] = useState({
    guestName: "",
    roomNumber: room ? String(room) : "",
    checkIn: today,
    checkOut: addDays(today, 2),
    guests: "2",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => {
    setF({ ...f, [k]: e.target.value });
    setError(null);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      guestName: f.guestName,
      roomNumber: Number(f.roomNumber),
      checkIn: f.checkIn,
      checkOut: f.checkOut,
      guests: Number(f.guests),
      notes: f.notes.trim() || undefined,
    };
    const err = validateReservation(state, input);
    if (err) return setError(err);
    dispatch({ type: "createReservation", input });
    toast.success(`Reservation created for ${input.guestName.trim()} · Room ${input.roomNumber}`);
    onClose();
  };
  const nights = f.checkIn && f.checkOut ? nightsBetween(f.checkIn, f.checkOut) : 0;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <p className="eyebrow">New reservation</p>
          <DialogTitle className="font-display text-3xl font-medium">Reserve a room</DialogTitle>
          <DialogDescription>Demo only — saved in this browser session.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="rf-name">Guest name</Label>
            <input
              id="rf-name"
              className="field"
              value={f.guestName}
              onChange={set("guestName")}
              placeholder="e.g. Amina Rahal"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="rf-room">Room</Label>
              <select
                id="rf-room"
                className="field"
                value={f.roomNumber}
                onChange={set("roomNumber")}
              >
                <option value="">Select…</option>
                {state.rooms.map((r) => (
                  <option key={r.number} value={r.number} disabled={r.status === "maintenance"}>
                    {r.number} · {r.type}
                    {r.status !== "available"
                      ? ` (${r.status === "maintenance" ? "out of service" : r.status})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rf-guests">Guests</Label>
              <input
                id="rf-guests"
                type="number"
                min={1}
                max={4}
                className="field"
                value={f.guests}
                onChange={set("guests")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="rf-in">Check-in</Label>
              <input
                id="rf-in"
                type="date"
                min={today}
                className="field"
                value={f.checkIn}
                onChange={set("checkIn")}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rf-out">Check-out</Label>
              <input
                id="rf-out"
                type="date"
                min={f.checkIn || today}
                className="field"
                value={f.checkOut}
                onChange={set("checkOut")}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rf-notes">Notes (optional)</Label>
            <input
              id="rf-notes"
              className="field"
              value={f.notes}
              onChange={set("notes")}
              placeholder="Late arrival, airport transfer…"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Select valid dates"}
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-sm border border-status-maintenance/50 bg-status-maintenance/10 px-3 py-2 text-sm text-foreground"
            >
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <CalendarPlus /> Create reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MaintenanceDialog({ room, onClose }: { room: number; onClose: () => void }) {
  const { dispatch } = useHotel();
  const [note, setNote] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-medium">
            Room {room} out of service
          </DialogTitle>
          <DialogDescription>
            The room will be unavailable for new arrivals today.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="mt-note">Reason</Label>
          <input
            id="mt-note"
            className="field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Plumbing repair"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              dispatch({ type: "setMaintenance", room, note });
              toast.success(`Room ${room} marked out of service`);
              onClose();
            }}
          >
            <Wrench /> Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RestoreDialog({ room, onClose }: { room: number; onClose: () => void }) {
  const { dispatch } = useHotel();
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-medium">
            Return Room {room} to service?
          </DialogTitle>
          <DialogDescription>
            Confirm that maintenance is complete and the room is ready for guests.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch({ type: "setAvailable", room });
              toast.success(`Room ${room} is now available`);
              onClose();
            }}
          >
            <CheckCircle2 /> Mark available
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
