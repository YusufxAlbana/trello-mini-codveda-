import api from './axios.js';
export const createList = (data) => api.post('/lists', data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data);
export const reorderLists = (data) => api.patch('/lists/reorder', data);
export const deleteList = (id) => api.delete(`/lists/${id}`);
