import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';

// ─── @desc    Get all boards for user
// ─── @route   GET /api/boards
// ─── @access  Private
export const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ members: req.user._id })
      .populate('owner', 'name email avatarColor')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: boards.length, boards });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get single board with lists and cards
// ─── @route   GET /api/boards/:id
// ─── @access  Private
export const getBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      members: req.user._id,
    }).populate('owner', 'name email avatarColor');

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    // Get lists ordered by position
    const lists = await List.find({ board: board._id }).sort({ position: 1 });

    // Get all cards for this board
    const cards = await Card.find({ board: board._id }).sort({ position: 1 });

    // Attach cards to their respective lists
    const listsWithCards = lists.map((list) => ({
      ...list.toObject(),
      cards: cards.filter((card) => card.list.toString() === list._id.toString()),
    }));

    res.json({ success: true, board, lists: listsWithCards });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Create a board
// ─── @route   POST /api/boards
// ─── @access  Private
export const createBoard = async (req, res, next) => {
  try {
    const { title, description, background } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Board title is required.' });
    }

    const board = await Board.create({
      title: title.trim(),
      description: description || '',
      background,
      owner: req.user._id,
      members: [req.user._id],
    });

    // Create default lists for new board
    const defaultLists = ['To Do', 'In Progress', 'Done'];
    await List.insertMany(
      defaultLists.map((title, index) => ({
        title,
        board: board._id,
        position: index,
      }))
    );

    await board.populate('owner', 'name email avatarColor');

    res.status(201).json({ success: true, message: 'Board created!', board });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Update a board
// ─── @route   PUT /api/boards/:id
// ─── @access  Private
export const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found or not authorized.' });
    }

    const { title, description, background, starred } = req.body;
    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    if (background !== undefined) board.background = background;
    if (starred !== undefined) board.starred = starred;

    await board.save();
    await board.populate('owner', 'name email avatarColor');

    res.json({ success: true, message: 'Board updated!', board });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Delete a board
// ─── @route   DELETE /api/boards/:id
// ─── @access  Private
export const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found or not authorized.' });
    }

    // Cascade delete lists and cards
    const lists = await List.find({ board: board._id });
    const listIds = lists.map((l) => l._id);

    await Card.deleteMany({ list: { $in: listIds } });
    await List.deleteMany({ board: board._id });
    await Board.findByIdAndDelete(board._id);

    res.json({ success: true, message: 'Board and all its content deleted.' });
  } catch (error) {
    next(error);
  }
};
