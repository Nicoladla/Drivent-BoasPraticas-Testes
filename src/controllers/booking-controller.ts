import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import hotelService from '@/services/hotels-service';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);

  try {
    await bookingService.checkRoomId(roomId);
    // await bookingService.checkIfUserCanMakeReservation(userId);

    // const booking = await bookingService.postBooking(userId, roomId);

    res.status(httpStatus.OK).send('');
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(err.message);
    }
  }
}
