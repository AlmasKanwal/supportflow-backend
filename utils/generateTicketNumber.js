const Ticket = require("../models/Ticket");

// Generates a human-friendly ticket number like SF-10001
const generateTicketNumber = async () => {
  const count = await Ticket.countDocuments();
  const nextNumber = 10001 + count;
  const ticketNumber = `SF-${nextNumber}`;

  // Just in case a ticket with this number already exists (e.g. after deletions),
  // keep incrementing until we find a free one.
  const existing = await Ticket.findOne({ ticketNumber });
  if (existing) {
    let n = nextNumber;
    let candidate;
    do {
      n += 1;
      candidate = `SF-${n}`;
    } while (await Ticket.findOne({ ticketNumber: candidate }));
    return candidate;
  }

  return ticketNumber;
};

module.exports = generateTicketNumber;
