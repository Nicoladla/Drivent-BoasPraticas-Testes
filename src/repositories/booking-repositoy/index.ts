import { prisma } from '@/config';

function getBookingByUserId(userId: number) {
  return prisma.booking.findFirst({ where: { userId } });
}

function getBookingById(id: number) {
  return prisma.booking.findFirst({ where: { id } });
}

function findPeopleOccupyingARoom(roomId: number) {
  return prisma.booking.findMany({ where: { roomId } });
}

function postBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: { userId, roomId },
  });
}

function updateBooking(bookingId: number, userId: number, roomId: number) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { userId, roomId },
  });
}

const bookingRepositoy = {
  postBooking,
  findPeopleOccupyingARoom,
  getBookingByUserId,
  getBookingById,
  updateBooking,
};

export default bookingRepositoy;
