import { addDays, todayISO } from "./dates";
import type { Feedback, HotelState, Reservation, Room, RoomType } from "./types";

export const TOTAL_ROOMS = 90;

const TYPES: {
  type: RoomType;
  capacity: number;
  rate: number;
  until: number;
}[] = [
  { type: "Deluxe King", capacity: 2, rate: 18000, until: 30 },
  { type: "Superior Twin", capacity: 2, rate: 16000, until: 60 },
  { type: "Junior Suite", capacity: 3, rate: 26000, until: 80 },
  { type: "Executive Suite", capacity: 4, rate: 38000, until: 88 },
  { type: "Royal Suite", capacity: 4, rate: 65000, until: 90 },
];

export const MAINTENANCE_ROOMS = [7, 23, 46, 64, 85];
export const ARRIVAL_ROOMS = [3, 12, 15, 18, 27, 34, 41, 52, 58, 63, 71, 77, 82, 89];
const MAINT_NOTES = [
  "Air conditioning unit being serviced.",
  "Bathroom fixtures replacement in progress.",
  "Carpet deep-cleaning scheduled.",
  "Electrical inspection pending.",
  "Minibar and TV replacement.",
];

const NAMES = [
  "Yasmine Benali",
  "Karim Haddad",
  "Sophie Laurent",
  "James Whitmore",
  "Leila Mansouri",
  "Omar Belkacem",
  "Claire Dubois",
  "Nadia Cherif",
  "Thomas Reed",
  "Amira Saadi",
  "Julien Moreau",
  "Sara Toumi",
  "Daniel Hughes",
  "Rania Bouzid",
  "Mehdi Zerrouki",
  "Isabelle Fontaine",
  "Hugo Martin",
  "Lina Ait Ali",
  "Victor Lambert",
  "Ines Kaci",
  "Adam Rahmani",
  "Emma Clarke",
  "Samir Larbi",
  "Camille Girard",
  "Youssef Amrani",
  "Olivia Bennett",
  "Rachid Ferhat",
  "Chloé Petit",
  "Nour El Houda",
  "Lucas Bernard",
  "Hana Meziane",
  "William Foster",
  "Salma Ouali",
  "Antoine Roux",
  "Farah Djebbar",
  "George Mitchell",
  "Meriem Hamidi",
  "Louis Fabre",
  "Aya Brahimi",
  "Nicolas Garnier",
  "Zineb Khelifi",
  "Henry Collins",
  "Selma Bouaziz",
  "Maxime Blanc",
  "Dalia Saidi",
  "Oscar Turner",
  "Imane Taleb",
  "Pierre Lefèvre",
  "Malik Benyahia",
  "Charlotte Hayes",
  "Kenza Yahiaoui",
  "Arthur Simon",
  "Riad Mokrani",
  "Alice Morel",
  "Sofiane Kherbouche",
  "Grace Walker",
  "Lamia Rezig",
  "Paul Mercier",
  "Assia Hadj",
  "Edward Price",
];

export function roomTypeFor(n: number) {
  return TYPES.find((t) => n <= t.until) ?? TYPES[0]!;
}

export function createSeed(): HotelState {
  const today = todayISO();
  const rooms: Room[] = [];
  const reservations: Reservation[] = [];
  let ref = 2401;
  let nameIdx = 0;
  const nextName = () => NAMES[nameIdx++ % NAMES.length]!;
  const created = new Date(Date.now() - 86400000 * 5).toISOString();

  // Deterministic occupancy pattern (~half of the rooms left after removing
  // maintenance and arrival rooms) so the demo looks realistic and stable.
  const remaining: number[] = [];
  for (let n = 1; n <= TOTAL_ROOMS; n++) {
    if (!MAINTENANCE_ROOMS.includes(n) && !ARRIVAL_ROOMS.includes(n)) remaining.push(n);
  }
  const occupied = new Set(remaining.filter((_, i) => i % 15 < 8));

  for (let n = 1; n <= TOTAL_ROOMS; n++) {
    const t = roomTypeFor(n);
    const room: Room = {
      number: n,
      type: t.type,
      capacity: t.capacity,
      rate: t.rate,
      status: "available",
    };
    if (MAINTENANCE_ROOMS.includes(n)) {
      room.status = "maintenance";
      room.maintenanceNote = MAINT_NOTES[MAINTENANCE_ROOMS.indexOf(n)];
    } else if (ARRIVAL_ROOMS.includes(n)) {
      room.status = "reserved";
      reservations.push({
        id: `AIF-${ref++}`,
        guestName: nextName(),
        roomNumber: n,
        checkIn: today,
        checkOut: addDays(today, (n % 4) + 2),
        guests: Math.min(2, t.capacity),
        status: "Expected Arrival",
        createdAt: created,
      });
    } else if (occupied.has(n)) {
      room.status = "occupied";
      reservations.push({
        id: `AIF-${ref++}`,
        guestName: nextName(),
        roomNumber: n,
        checkIn: addDays(today, -((n % 4) + 1)),
        checkOut: addDays(today, (n % 5) + 1),
        guests: Math.min(1 + (n % 2), t.capacity),
        status: "Checked In",
        createdAt: created,
      });
    }
    rooms.push(room);
  }

  // Future confirmed bookings on currently available rooms (no conflict with today).
  const available = rooms.filter((r) => r.status === "available");
  available.slice(0, 8).forEach((r, i) => {
    const start = addDays(today, 3 + i);
    reservations.push({
      id: `AIF-${ref++}`,
      guestName: nextName(),
      roomNumber: r.number,
      checkIn: start,
      checkOut: addDays(start, 2 + (i % 3)),
      guests: 2,
      status: "Confirmed",
      createdAt: created,
    });
  });
  // Past checked-out and cancelled records.
  available.slice(8, 12).forEach((r, i) => {
    reservations.push({
      id: `AIF-${ref++}`,
      guestName: nextName(),
      roomNumber: r.number,
      checkIn: addDays(today, -4 - i),
      checkOut: addDays(today, -1 - (i % 2)),
      guests: 2,
      status: "Checked Out",
      createdAt: created,
    });
  });
  available.slice(12, 14).forEach((r, i) => {
    reservations.push({
      id: `AIF-${ref++}`,
      guestName: nextName(),
      roomNumber: r.number,
      checkIn: addDays(today, 5 + i),
      checkOut: addDays(today, 7 + i),
      guests: 1,
      status: "Cancelled",
      createdAt: created,
    });
  });

  const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();
  const feedback: Feedback[] = [
    {
      id: "FB-101",
      createdAt: h(2),
      category: "Check-Out Rating",
      roomNumber: 36,
      guestName: "Martin Keller",
      rating: 2,
      reasons: ["Noise"],
      comment: "The room was lovely but there was loud construction noise early in the morning.",
      status: "New",
    },
    {
      id: "FB-102",
      createdAt: h(5),
      category: "Cleanliness",
      roomNumber: 19,
      rating: 3,
      reasons: ["Room Cleanliness"],
      comment: "Bathroom was not fully cleaned on arrival. Staff fixed it quickly after I called.",
      status: "New",
    },
    {
      id: "FB-103",
      createdAt: h(9),
      category: "Service",
      roomNumber: 72,
      guestName: "Elena Rossi",
      rating: 5,
      comment:
        "Exceptional welcome at reception. Thank you to the concierge for the restaurant recommendation.",
      status: "Reviewed",
    },
    {
      id: "FB-104",
      createdAt: h(20),
      category: "Check-Out Rating",
      roomNumber: 84,
      guestName: "Hamza Bensaid",
      rating: 1,
      reasons: ["Staff Service", "Facilities"],
      comment: "Waited 40 minutes for room service and the spa was closed without notice.",
      status: "New",
    },
    {
      id: "FB-105",
      createdAt: h(28),
      category: "Comfort",
      roomNumber: 55,
      rating: 4,
      comment: "Very comfortable bed. Pillows could be a little firmer.",
      status: "Resolved",
    },
    {
      id: "FB-106",
      createdAt: h(40),
      category: "Facilities",
      comment: "Would love longer opening hours for the pool.",
      status: "Reviewed",
    },
    {
      id: "FB-107",
      createdAt: h(52),
      category: "Check-Out Rating",
      roomNumber: 90,
      guestName: "Laura Chen",
      rating: 5,
      comment: "The Royal Suite exceeded all expectations. We will be back.",
      status: "Resolved",
    },
  ];

  return { rooms, reservations, feedback, role: null };
}
