import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const client = axios.create({ baseURL, timeout: 45_000, headers: { 'Content-Type': 'application/json' } });

export async function request(path, { method = 'GET', data, token } = {}) {
  try {
    const response = await client.request({ url: path, method, data, headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || (error.code === 'ECONNABORTED' ? 'The case engine took too long to respond.' : 'Could not reach the investigation server. Make sure the API is running.');
    throw new Error(message);
  }
}

export const authApi = {
  login: (data) => request('/auth/login', { method: 'POST', data }),
  register: (data) => request('/auth/register', { method: 'POST', data }),
};

export const mysteryApi = {
  generate: (data, token) => request('/mysteries/generate', { method: 'POST', data, token }),
  get: (id, token) => request(`/mysteries/${id}`, { token }),
  result: (id, token) => request(`/mysteries/${id}/result`, { token }),
  notes: (id, token) => request(`/mysteries/${id}/notes`, { token }),
  addNote: (id, data, token) => request(`/mysteries/${id}/notes`, { method: 'POST', data, token }),
  updateNote: (id, noteId, data, token) => request(`/mysteries/${id}/notes/${noteId}`, { method: 'PUT', data, token }),
  deleteNote: (id, noteId, token) => request(`/mysteries/${id}/notes/${noteId}`, { method: 'DELETE', token }),
  accuse: (id, data, token) => request(`/mysteries/${id}/accuse`, { method: 'POST', data, token }),
  list: (token) => request('/mysteries', { token }),
};
