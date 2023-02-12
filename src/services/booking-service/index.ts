import { notFoundError, conflictError } from '@/errors';
import { forbiddenError } from '@/errors/forbidden-error';
import bookingRepositoy from '@/repositories/booking-repositoy';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelRepository from '@/repositories/hotel-repository';
import ticketRepository from '@/repositories/ticket-repository';
import { Room } from '@prisma/client';

async function getBooking(userId: number) {
  const booking = await bookingRepositoy.getBookingByUserId(userId);

  if (!booking) throw notFoundError();

  return booking;
}

async function checkRoomId(roomId: number) {
  if (isNaN(roomId)) throw notFoundError();

  const roomExist: Room = await hotelRepository.findRoomById(roomId);
  if (!roomExist) throw notFoundError();

  const spacesOccupiedInRoom = await bookingRepositoy.findPeopleOccupyingARoom(roomId);
  const remainingVacancies = roomExist.capacity - spacesOccupiedInRoom.length;

  if (remainingVacancies === 0) throw forbiddenError('The room has vacancies filled');
}

async function checkIfUserCanMakeReservation(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw forbiddenError('User has not enrollment');

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError('Invalid ticket');
  }
}

async function postBooking(userId: number, roomId: number) {
  const userHasbooking = await bookingRepositoy.getBookingByUserId(userId);
  if (userHasbooking) throw conflictError('The user already has a reservation');

  const booking = await bookingRepositoy.postBooking(userId, roomId);
  return booking;
}

async function updateBooking(bookingId: number, userId: number, roomId: number) {
  const userHasbooking = await bookingRepositoy.getBookingById(bookingId);
  if (!userHasbooking) throw forbiddenError('Booking not found');

  if (userHasbooking.userId !== userId) throw forbiddenError('This booking does not belong to this user');

  const updatedBooking = await bookingRepositoy.updateBooking(bookingId, userId, roomId);
  return updatedBooking;
}

const bookingService = {
  postBooking,
  checkIfUserCanMakeReservation,
  checkRoomId,
  updateBooking,
  getBooking
};

export default bookingService;
