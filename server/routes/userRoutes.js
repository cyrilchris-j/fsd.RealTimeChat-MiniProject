import express from 'express';
import { getUsers, getUser, searchUsers, getOnlineUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/search', protect, searchUsers);
router.get('/online', protect, getOnlineUsers);
router.get('/:id', protect, getUser);

export default router;