import List from '../models/List.js';
import Card from '../models/Card.js';
import Board from '../models/Board.js';

// ─── Helper: Check board membership ───────────────────────────────────────────
const checkBoardAccess = async (boardId, userId) => {
  return Board.findOne({ _id: boardId, members: userId });
};

// ─── @desc    Create a list
// ─── @route   POST /api/lists
// ─── @access  Private
export const createList = async (req, res, next) => {
  try {
    const { title, boardId } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'List title is required.' });
    }

    const board = await checkBoardAccess(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    // Get highest position
    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({ title: title.trim(), board: boardId, position });

    res.status(201).json({ success: true, message: 'List created!', list: { ...list.toObject(), cards: [] } });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update a list (title, color)
// ─── @route   PUT /api/lists/:id
// ─── @access  Private
export const updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found.' });

    const board = await checkBoardAccess(list.board, req.user._id);
    if (!board) return res.status(403).json({ success: false, message: 'Not authorized.' });

    const { title, color } = req.body;
    if (title !== undefined) list.title = title;
    if (color !== undefined) list.color = color;

    await list.save();
    res.json({ success: true, message: 'List updated!', list });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Reorder lists within a board
// ─── @route   PATCH /api/lists/reorder
// ─── @access  Private
export const reorderLists = async (req, res, next) => {
  try {
    const { boardId, orderedIds } = req.body;

    const board = await checkBoardAccess(boardId, req.user._id);
    if (!board) return res.status(403).json({ success: false, message: 'Not authorized.' });

    // Update positions in bulk
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { position: index } },
    }));
    await List.bulkWrite(bulkOps);

    res.json({ success: true, message: 'Lists reordered!' });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete a list (and its cards)
// ─── @route   DELETE /api/lists/:id
// ─── @access  Private
export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found.' });

    const board = await checkBoardAccess(list.board, req.user._id);
    if (!board) return res.status(403).json({ success: false, message: 'Not authorized.' });

    // Delete all cards in the list
    await Card.deleteMany({ list: list._id });
    await List.findByIdAndDelete(list._id);

    res.json({ success: true, message: 'List and its cards deleted.' });
  } catch (error) {
    next(error);
  }
};
