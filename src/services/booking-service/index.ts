import { notFoundError } from '@/errors';
import { forbiddenError } from '@/errors/forbidden-error';
import bookingRepositoy from '@/repositories/booking-repositoy';
import hotelRepository from '@/repositories/hotel-repository';
import { Room } from '@prisma/client';
import hotelService from '../hotels-service';

async function checkRoomId(roomId: number) {
  if (isNaN(roomId)) throw notFoundError();

  const roomExist: Room = await hotelRepository.findRoomById(roomId);
  const spacesOccupiedInRoom = await bookingRepositoy.findPeopleOccupyingARoom(roomId);
  const remainingVacancies = roomExist.capacity - spacesOccupiedInRoom.length;

  if (!roomExist) throw notFoundError();
  if (remainingVacancies === 0) throw forbiddenError('The room has vacancies filled');
}

async function checkIfUserCanMakeReservation(userId: number) {
  await hotelService.listHotels(userId);
}

async function postBooking(userId: number, roomId: number) {}

const bookingService = {
  postBooking,
  checkIfUserCanMakeReservation,
  checkRoomId,
};

export default bookingService;
