import express from 'express';
import { getConversations, createConversation, getConversation } from '../controllers/conversationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getConversations);
router.post('/', protect, createConversation);
router.get('/:id', protect, getConversation);

export default router;