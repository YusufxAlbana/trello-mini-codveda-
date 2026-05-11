import express from 'express';
import { createList, updateList, reorderLists, deleteList } from '../controllers/listController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createList);
router.put('/:id', updateList);
router.patch('/reorder', reorderLists);
router.delete('/:id', deleteList);

export default router;
