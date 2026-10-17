import { apiRequest } from './authApi';

const BASE = '/api/invoices';

export const getInvoices = () => apiRequest(BASE);
export const getInvoice = (id) => apiRequest(`${BASE}/${id}`);
export const getNextNumber = () => apiRequest(`${BASE}/next-number`);
export const getReportByStatus = () => apiRequest(`${BASE}/report/by-status`);
export const getDashboard = () => apiRequest(`${BASE}/dashboard`);
export const sendInvoiceEmail = (id, data) =>
  apiRequest(`${BASE}/${id}/email`, { method: 'POST', body: JSON.stringify(data) });
export const createInvoice = (data) => apiRequest(BASE, { method: 'POST', body: JSON.stringify(data) });
export const updateInvoice = (id, data) => apiRequest(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInvoice = (id) => apiRequest(`${BASE}/${id}`, { method: 'DELETE' });
