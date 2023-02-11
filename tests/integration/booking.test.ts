import app, { init } from '@/app';
import { prisma } from '@/config';
import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketTypeRemote,
  createUser,
  createHotel,
  createRoomWithHotelId,
  createBooking,
  createTicketTypeWithHotel,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const result = await server.get('/booking');

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const result = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when roomId is invalid', () => {
    it('should respond status 404 if roomId is not a number', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const roomIdError = faker.lorem.word();

      const result = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomIdError });

      expect(result.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond status 404 if roomId does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const roomIdNotExist = 0;

      const result = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomIdNotExist });

      expect(result.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond status 403 if the room has no vacancies', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(room.id);

      const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(result.status).toEqual(httpStatus.FORBIDDEN);
    });
  });

  describe('when enrollment or ticket is invalid', () => {
    it('should respond with status 403 when user ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(result.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when user has no enrollment', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      expect(result.status).toEqual(httpStatus.FORBIDDEN);
    });
  });

  describe('when token, registration, ticket and roomId is valid', () => {
    it('should respond status 409 if user already has a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const reservedRoom = await createRoomWithHotelId(hotel.id);
      const roomToBeBooked = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(reservedRoom.id, user);

      const result = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: roomToBeBooked.id });

      expect(result.status).toEqual(httpStatus.CONFLICT);
    });

    it('should respond status 200 and the bookingId when the booking has been successfully made', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const beforeCount = await prisma.booking.count();

      const result = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

      const afterCount = await prisma.booking.count();

      expect(result.status).toEqual(httpStatus.OK);
      expect(result.body).toEqual({ bookingId: expect.any(Number) });
      expect(beforeCount).toBe(0);
      expect(afterCount).toBe(1);
    });
  });
});
