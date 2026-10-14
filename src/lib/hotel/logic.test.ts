import { describe, expect, it } from "vitest";
import { addDays, todayISO } from "./dates";
import { reducer, roomCounts, validateReservation } from "./logic";
import { createSeed } from "./seed";

describe("hotel rules", () => {
  it("seeds exactly 90 rooms whose statuses add up to 90", () => {
    const s = createSeed();
    expect(s.rooms).toHaveLength(90);
    const c = roomCounts(s);
    expect(c.available + c.occupied + c.reserved + c.maintenance).toBe(90);
  });

  it("rejects overlapping active reservations for the same room", () => {
    const s = createSeed();
    const occ = s.reservations.find((r) => r.status === "Checked In")!;
    const err = validateReservation(s, {
      guestName: "Test",
      roomNumber: occ.roomNumber,
      checkIn: todayISO(),
      checkOut: addDays(todayISO(), 1),
      guests: 1,
    });
    expect(err).toMatch(/already booked/);
  });

  it("check-in makes room occupied, check-out makes it available", () => {
    let s = createSeed();
    const arr = s.reservations.find((r) => r.status === "Expected Arrival")!;
    s = reducer(s, { type: "checkIn", id: arr.id });
    expect(s.rooms.find((r) => r.number === arr.roomNumber)!.status).toBe("occupied");
    s = reducer(s, { type: "checkOut", id: arr.id });
    expect(s.rooms.find((r) => r.number === arr.roomNumber)!.status).toBe("available");
    expect(s.reservations.find((r) => r.id === arr.id)!.status).toBe("Checked Out");
  });
});
