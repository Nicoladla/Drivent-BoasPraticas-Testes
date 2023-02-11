import { postBooking, putBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

const bookingRouter = Router();

bookingRouter
    .all("/*", authenticateToken)
    .get("/")
    .post("/", postBooking)
    .put("/:bookingId", putBooking)

export { bookingRouter };
