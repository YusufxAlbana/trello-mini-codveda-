import express from 'express';
import { createCard, getCard, updateCard, moveCard, deleteCard } from '../controllers/cardController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createCard);
router.get('/:id', getCard);
router.put('/:id', updateCard);
router.patch('/:id/move', moveCard);
router.delete('/:id', deleteCard);

export default router;
