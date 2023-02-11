import { prisma } from '@/config';
import { TicketStatus, User } from '@prisma/client';
import { createEnrollmentWithAddress } from './enrollments-factory';
import { createPayment } from './payments-factory';
import { createTicket, createTicketTypeWithHotel } from './tickets-factory';
import { createUser } from './users-factory';

export async function createBooking(roomId: number, userInput?: User) {
  const user = userInput || (await createUser());
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketTypeWithHotel();
  const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  const payment = await createPayment(ticket.id, ticketType.price);

  return prisma.booking.create({
    data: {
      userId: user.id,
      roomId,
    },
  });
}
