import { notFoundError, conflictError } from '@/errors';
import { forbiddenError } from '@/errors/forbidden-error';
import bookingRepositoy from '@/repositories/booking-repositoy';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelRepository from '@/repositories/hotel-repository';
import ticketRepository from '@/repositories/ticket-repository';
import { Room } from '@prisma/client';

async function checkRoomId(roomId: number) {
  if (isNaN(roomId)) throw notFoundError();

  const roomExist: Room = await hotelRepository.findRoomById(roomId);
  if (!roomExist) throw notFoundError();

  const spacesOccupiedInRoom = await bookingRepositoy.findPeopleOccupyingARoom(roomId);
  const remainingVacancies = roomExist.capacity - spacesOccupiedInRoom.length;

  if (remainingVacancies === 0) throw forbiddenError('The room has vacancies filled'); //falta validar
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

  const booking= await bookingRepositoy.postBooking(userId, roomId)
  return booking
}

const bookingService = {
  postBooking,
  checkIfUserCanMakeReservation,
  checkRoomId,
};

export default bookingService;
