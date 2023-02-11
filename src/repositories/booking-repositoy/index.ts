import { prisma } from '@/config';

function getBookingByUserId(userId: number) {
  return prisma.booking.findFirst({ where: { userId } });
}

function findPeopleOccupyingARoom(roomId: number) {
  return prisma.booking.findMany({ where: { id: roomId } });
}

function postBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: { userId, roomId },
  });
}

const bookingRepositoy = {
  postBooking,
  findPeopleOccupyingARoom,
  getBookingByUserId,
};

export default bookingRepositoy;
