import express from 'express';
import { getBoards, getBoard, createBoard, updateBoard, deleteBoard } from '../controllers/boardController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All board routes require authentication

router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;
