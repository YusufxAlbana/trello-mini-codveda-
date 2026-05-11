import Card from '../models/Card.js';
import List from '../models/List.js';
import Board from '../models/Board.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const checkBoardAccess = async (boardId, userId) => {
  return Board.findOne({ _id: boardId, members: userId });
};

// ─── @desc    Create a card
// ─── @route   POST /api/cards
// ─── @access  Private
export const createCard = async (req, res, next) => {
  try {
    const { title, listId, boardId } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Card title is required.' });
    }

    const board = await checkBoardAccess(boardId, req.user._id);
    if (!board) return res.status(404).json({ success: false, message: 'Board not found.' });

    const list = await List.findOne({ _id: listId, board: boardId });
    if (!list) return res.status(404).json({ success: false, message: 'List not found.' });

    // Get next position
    const lastCard = await Card.findOne({ list: listId }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await Card.create({
      title: title.trim(),
      list: listId,
      board: boardId,
      position,
    });

    res.status(201).json({ success: true, message: 'Card created!', card });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get a single card
// ─── @route   GET /api/cards/:id
// ─── @access  Private
export const getCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found.' });

    const board = await checkBoardAccess(card.board, req.user._id);
    if (!board) return res.status(403).json({ success: false, message: 'Not authorized.' });

    res.json({ success: true, card });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update a card
// ─── @route   PUT /api/cards/:id
// ─── @access  Private
export const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found.' });

    const board = await checkBoardAccess(card.board, req.user._id);
    if (!board) return res.status(403).json({ success: false, message: 'Not authorized.' });

    const allowedFields = ['title', 'description', 'priority', 'dueDate', 'labels', 'completed', 'coverColor'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        card[field] = req.body[field];
      }
    });

    await card.save();
    res.json({ success: true, message: 'Card updated!', card });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Move card to another list (drag & drop)
// ─── @route   PATCH /api/cards/:id/move
// ─── @access  Private
export const moveCard = async (req, res, next) => {
  try {
    const { newListId, newPosition, sourceListId, sourceCards, destListId, destCards } = req.body;

    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found.' });

    const board = await checkBoardAccess(card.board, req.user._id);
    if (!board) return res.status(403).json({ success: false, message: 'Not authorized.' });

    // Bulk update source list card positions
    if (sourceCards && sourceCards.length > 0) {
      const srcOps = sourceCards.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { position: index } },
      }));
      await Card.bulkWrite(srcOps);
    }

    // Bulk update destination list card positions
    if (destCards && destCards.length > 0 && destListId) {
      const destOps = destCards.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { position: index, list: destListId } },
      }));
      await Card.bulkWrite(destOps);
    } else {
      // Simple move
      card.list = newListId;
      card.position = newPosition ?? 0;
      await card.save();
    }

    const updatedCard = await Card.findById(req.params.id);
    res.json({ success: true, message: 'Card moved!', card: updatedCard });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete a card
// ─── @route   DELETE /api/cards/:id
// ─── @access  Private
export const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found.' });

    const board = await checkBoardAccess(card.board, req.user._id);
    if (!board) return res.status(403).json({ success: false, message: 'Not authorized.' });

    await Card.findByIdAndDelete(card._id);
    res.json({ success: true, message: 'Card deleted.' });
  } catch (error) {
    next(error);
  }
};
