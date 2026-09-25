import { Router } from 'express';
import {
  createEvent, getEvents, getEvent, registerForEvent,
  cancelRegistration, updateEvent,
} from '../controllers/eventController.js';
import { authenticateUser } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createEventSchema, updateEventSchema } from '../validators/eventValidator.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(authenticateUser);

router.post('/', upload.single('poster'), validate(createEventSchema), createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/:id/register', registerForEvent);
router.delete('/:id/register', cancelRegistration);
router.patch('/:id', upload.single('poster'), validate(updateEventSchema), updateEvent);

export default router;
