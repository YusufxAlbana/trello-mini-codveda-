import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, X, Check, MoreHorizontal, Trash2, Edit3, Calendar, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/ui/Navbar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import CardDetailModal from '../components/board/CardDetailModal.jsx';
import { getBoard } from '../api/boardApi.js';
import { createList, updateList, deleteList, reorderLists } from '../api/listApi.js';
import { createCard, updateCard, moveCard, deleteCard } from '../api/cardApi.js';

const PRIORITY_COLORS = { low: '#059669', medium: '#d97706', high: '#ea580c', urgent: '#FF4757' };
const COVER_COLORS = ['#6C63FF','#FF6584','#43E6C5','#FFB347','#4FACFE','#f093fb','#f5576c','#43e97b'];

function KanbanCard({ card, index, onOpen }) {
  const isOverdue = card.dueDate && !card.completed && new Date(card.dueDate) < new Date();
  const isSoon = card.dueDate && !card.completed && !isOverdue &&
    (new Date(card.dueDate) - new Date()) < 86400000 * 2;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={() => onOpen(card)}>
          {card.coverColor && <div className="kanban-card-cover" style={{ background: card.coverColor }} />}
          {card.labels?.length > 0 && (
            <div className="kanban-card-labels">
              {card.labels.map((l, i) => <div key={i} className="card-label" style={{ background: l.color }} title={l.text} />)}
            </div>
          )}
          <div className="kanban-card-title" style={{ textDecoration: card.completed ? 'line-through' : 'none', opacity: card.completed ? 0.6 : 1 }}>
            {card.title}
          </div>
          <div className="kanban-card-footer">
            <span className="badge" style={{ background: PRIORITY_COLORS[card.priority] + '20', color: PRIORITY_COLORS[card.priority], fontSize: 11 }}>
              {card.priority}
            </span>
            {card.dueDate && (
              <span className={`kanban-card-due ${isOverdue ? 'due-overdue' : isSoon ? 'due-soon' : 'due-ok'}`}>
                <Calendar size={12} /> {new Date(card.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {card.completed && <span style={{ fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Done</span>}
          </div>
        </div>
      )}
    </Draggable>
  );
}

function AddCardForm({ listId, boardId, onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await createCard({ title, listId, boardId });
      onAdd(res.data.card);
      setTitle('');
    } catch { toast.error('Failed to create card'); }
    finally { setLoading(false); }
  };

  return (
    <div className="add-card-form">
      <textarea className="add-card-input" placeholder="Enter card title..." value={title} autoFocus
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } if (e.key === 'Escape') onCancel(); }}
        rows={2} />
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading || !title.trim()}>
          <Check size={14} /> Add
        </button>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={onCancel}><X size={14} /></button>
      </div>
    </div>
  );
}

function KanbanList({ list, boardId, onAddCard, onDeleteList, onUpdateTitle, onDeleteCard, onUpdateCard, onOpenCard }) {
  const [addingCard, setAddingCard] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [menuOpen, setMenuOpen] = useState(false);

  const saveTitle = async () => {
    setEditingTitle(false);
    if (title.trim() === list.title) return;
    try { await updateList(list._id, { title }); onUpdateTitle(list._id, title); }
    catch { toast.error('Failed to update list'); setTitle(list.title); }
  };

  return (
    <div className="kanban-list">
      <div className="kanban-list-header">
        {editingTitle ? (
          <input className="kanban-list-title-input" value={title} autoFocus
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitle(list.title); setEditingTitle(false); } }} />
        ) : (
          <span className="kanban-list-title" onDoubleClick={() => setEditingTitle(true)}>{list.title}</span>
        )}
        <span className="kanban-list-count">{list.cards?.length || 0}</span>
        <div style={{ position: 'relative', marginLeft: 4 }}>
          <button className="btn btn-ghost btn-icon" style={{ padding: 4 }} onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', minWidth: 160, zIndex: 20, overflow: 'hidden' }}>
              <div style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => { setEditingTitle(true); setMenuOpen(false); }}>
                <Edit3 size={13} /> Rename list
              </div>
              <div style={{ padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => { onDeleteList(list._id); setMenuOpen(false); }}>
                <Trash2 size={13} /> Delete list
              </div>
            </div>
          )}
        </div>
      </div>

      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-list-cards"
            style={{ background: snapshot.isDraggingOver ? 'rgba(108,99,255,0.06)' : undefined }}>
            {(list.cards || []).map((card, i) => (
              <KanbanCard key={card._id} card={card} index={i} onOpen={onOpenCard} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="kanban-list-footer">
        {addingCard ? (
          <AddCardForm listId={list._id} boardId={boardId}
            onAdd={(card) => { onAddCard(list._id, card); setAddingCard(false); }}
            onCancel={() => setAddingCard(false)} />
        ) : (
          <button className="add-card-btn" onClick={() => setAddingCard(true)}>
            <Plus size={14} /> Add a card
          </button>
        )}
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => { fetchBoard(); }, [id]);

  const fetchBoard = async () => {
    try {
      const res = await getBoard(id);
      setBoard(res.data.board);
      setLists(res.data.lists);
    } catch { toast.error('Failed to load board'); navigate('/'); }
    finally { setLoading(false); }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const res = await createList({ title: newListTitle, boardId: id });
      setLists([...lists, res.data.list]);
      setNewListTitle('');
      setAddingList(false);
      toast.success('List added!');
    } catch { toast.error('Failed to add list'); }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm('Delete this list and all its cards?')) return;
    try {
      await deleteList(listId);
      setLists(lists.filter(l => l._id !== listId));
      toast.success('List deleted');
    } catch { toast.error('Failed to delete list'); }
  };

  const handleUpdateTitle = (listId, title) => {
    setLists(lists.map(l => l._id === listId ? { ...l, title } : l));
  };

  const handleAddCard = (listId, card) => {
    setLists(lists.map(l => l._id === listId ? { ...l, cards: [...(l.cards || []), card] } : l));
    toast.success('Card added!');
  };

  const handleDeleteCard = async (cardId, listId) => {
    try {
      await deleteCard(cardId);
      setLists(lists.map(l => l._id === listId ? { ...l, cards: l.cards.filter(c => c._id !== cardId) } : l));
      setSelectedCard(null);
      toast.success('Card deleted');
    } catch { toast.error('Failed to delete card'); }
  };

  const handleUpdateCard = (updatedCard) => {
    setLists(lists.map(l => l._id === updatedCard.list
      ? { ...l, cards: l.cards.map(c => c._id === updatedCard._id ? updatedCard : c) }
      : l));
    setSelectedCard(updatedCard);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const srcList = lists.find(l => l._id === source.droppableId);
    const dstList = lists.find(l => l._id === destination.droppableId);
    const card = srcList.cards[source.index];

    // Optimistic update
    const newLists = lists.map(l => {
      if (l._id === source.droppableId && l._id === destination.droppableId) {
        const cards = [...l.cards];
        cards.splice(source.index, 1);
        cards.splice(destination.index, 0, card);
        return { ...l, cards };
      }
      if (l._id === source.droppableId) {
        const cards = [...l.cards];
        cards.splice(source.index, 1);
        return { ...l, cards };
      }
      if (l._id === destination.droppableId) {
        const cards = [...l.cards];
        cards.splice(destination.index, 0, { ...card, list: l._id });
        return { ...l, cards };
      }
      return l;
    });
    setLists(newLists);

    try {
      const updatedSrcList = newLists.find(l => l._id === source.droppableId);
      const updatedDstList = newLists.find(l => l._id === destination.droppableId);
      await moveCard(draggableId, {
        newListId: destination.droppableId,
        destListId: destination.droppableId,
        sourceCards: updatedSrcList.cards.map(c => c._id),
        destCards: source.droppableId !== destination.droppableId ? updatedDstList.cards.map(c => c._id) : null,
      });
    } catch { toast.error('Failed to move card'); fetchBoard(); }
  };

  if (loading) return <><Navbar /><LoadingSpinner fullScreen /></>;

  return (
    <div className="board-page">
      <Navbar />
      <div className="board-topbar" style={{ background: `${board?.background}18` }}>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')}><ArrowLeft size={18} /></button>
        <div className="board-topbar-title">{board?.title}</div>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: board?.background, flexShrink: 0 }} />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-canvas" style={{ background: `linear-gradient(135deg, ${board?.background}15, ${board?.background}05)` }}>
          {lists.map(list => (
            <KanbanList key={list._id} list={list} boardId={id}
              onAddCard={handleAddCard} onDeleteList={handleDeleteList}
              onUpdateTitle={handleUpdateTitle} onDeleteCard={handleDeleteCard}
              onUpdateCard={handleUpdateCard} onOpenCard={setSelectedCard} />
          ))}

          {/* Add list column */}
          <div className="add-list-col">
            {addingList ? (
              <div className="add-list-form">
                <input className="input" placeholder="List title..." value={newListTitle} autoFocus
                  onChange={e => setNewListTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddList(); if (e.key === 'Escape') setAddingList(false); }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleAddList}><Check size={14} /> Add</button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setAddingList(false)}><X size={14} /></button>
                </div>
              </div>
            ) : (
              <button className="add-list-btn" onClick={() => setAddingList(true)} style={{ color: board?.background, background: `${board?.background}22`, borderColor: `${board?.background}66` }}>
                <Plus size={16} /> Add another list
              </button>
            )}
          </div>
        </div>
      </DragDropContext>

      {selectedCard && (
        <CardDetailModal card={selectedCard} listTitle={lists.find(l => l._id === selectedCard.list)?.title}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
          onDelete={(cardId) => handleDeleteCard(cardId, selectedCard.list)} />
      )}
    </div>
  );
}
