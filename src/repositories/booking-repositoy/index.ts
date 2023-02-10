import { prisma } from '@/config';

async function findPeopleOccupyingARoom(roomId: number) {
  return prisma.booking.findMany({ where: { id: roomId } });
}

async function postBooking(userId: number, roomId: number) {}

const bookingRepositoy = {
  postBooking,
  findPeopleOccupyingARoom,
};

export default bookingRepositoy;
