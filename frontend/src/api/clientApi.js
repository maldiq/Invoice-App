import { apiRequest } from './authApi';

const BASE = '/api/clients';

export const getClients = () => apiRequest(BASE);
export const getClient = (id) => apiRequest(`${BASE}/${id}`);
export const createClient = (data) => apiRequest(BASE, { method: 'POST', body: JSON.stringify(data) });
export const updateClient = (id, data) => apiRequest(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteClient = (id) => apiRequest(`${BASE}/${id}`, { method: 'DELETE' });
