export type Role = "receptionist" | "supervisor";
export type RoomStatus = "available" | "occupied" | "reserved" | "maintenance";
export type RoomType =
  "Deluxe King" | "Superior Twin" | "Junior Suite" | "Executive Suite" | "Royal Suite";
export type ReservationStatus =
  "Confirmed" | "Expected Arrival" | "Checked In" | "Checked Out" | "Cancelled";
export type FeedbackCategory =
  "Service" | "Cleanliness" | "Comfort" | "Facilities" | "Other" | "Check-Out Rating";
export type FeedbackStatus = "New" | "Reviewed" | "Resolved";

export interface Room {
  number: number;
  type: RoomType;
  capacity: number;
  rate: number;
  status: RoomStatus;
  maintenanceNote?: string | undefined;
}

export interface Reservation {
  id: string; // reference e.g. AIF-2401
  guestName: string;
  roomNumber: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  guests: number;
  status: ReservationStatus;
  notes?: string | undefined;
  createdAt: string;
}

export interface Feedback {
  id: string;
  createdAt: string; // ISO datetime
  category: FeedbackCategory;
  roomNumber?: number | undefined;
  guestName?: string | undefined;
  rating?: number | undefined;
  reasons?: string[] | undefined;
  comment: string;
  status: FeedbackStatus;
}

export interface HotelState {
  rooms: Room[];
  reservations: Reservation[];
  feedback: Feedback[];
  role: Role | null;
}
