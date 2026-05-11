import api from './axios.js';
export const createCard = (data) => api.post('/cards', data);
export const getCard = (id) => api.get(`/cards/${id}`);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data);
export const moveCard = (id, data) => api.patch(`/cards/${id}/move`, data);
export const deleteCard = (id) => api.delete(`/cards/${id}`);
