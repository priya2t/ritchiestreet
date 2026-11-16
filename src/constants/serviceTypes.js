// Shared service type / specialization options.
// MUST stay identical between the Book a Service form (service_type) and the
// Service Engineer Registration form (specialization) — the backend matches
// bookings to engineers by exact string.
export const SERVICE_TYPES = [
  'Laptop / Desktop Repair',
  'Mobile Repair',
  'Printer Repair',
  'CCTV Installation & Repair',
  'TV Repair',
  'Networking',
  'Data Recovery',
  'General Electronics',
  'Other'
];
