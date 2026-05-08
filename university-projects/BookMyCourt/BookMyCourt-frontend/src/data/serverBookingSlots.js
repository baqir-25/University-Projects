/**
 * Canonical labels for POST /api/bookings — must match server exactly.
 */
export const SERVER_BOOKING_TIME_SLOTS = [
  "06:00 AM - 07:00 AM",
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM",
];

/** Single section for the slot picker when using API booking. */
export const SERVER_BOOKING_TIME_GRID = { "Available times": SERVER_BOOKING_TIME_SLOTS };
