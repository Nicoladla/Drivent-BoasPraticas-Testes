import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(userId);

    res.status(httpStatus.OK).send(booking);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(err.message);
    }
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);

  try {
    await bookingService.checkRoomId(roomId);
    await bookingService.checkIfUserCanMakeReservation(userId);

    const booking = await bookingService.postBooking(userId, roomId);

    res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(err.message);
    }
    if (err.name === 'forbiddenError') {
      return res.status(httpStatus.FORBIDDEN).send(err.message);
    }
    if (err.name === 'ConflictError') {
      return res.status(httpStatus.CONFLICT).send(err.message);
    }
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);
  const bookingId = Number(req.params.bookingId);

  if (isNaN(bookingId)) return res.status(httpStatus.BAD_REQUEST).send('Invalid params');

  try {
    await bookingService.checkRoomId(roomId);

    const updatedBooking = await bookingService.updateBooking(bookingId, userId, roomId);

    res.status(httpStatus.OK).send({ bookingId: updatedBooking.id });
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(err.message);
    }
    if (err.name === 'forbiddenError') {
      return res.status(httpStatus.FORBIDDEN).send(err.message);
    }
  }
}
