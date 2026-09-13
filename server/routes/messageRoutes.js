import express from 'express';
import { getMessages, sendMessage, markAsRead } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);
router.patch('/:id/read', protect, markAsRead);

export default router;