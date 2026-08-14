import { apiRequest } from './client';

export const getDepartments = () => apiRequest('/departments');
export const createDepartment = name => apiRequest('/departments', { method: 'POST', body: JSON.stringify({ name }) });
export const deleteDepartment = id => apiRequest(`/departments/${id}`, { method: 'DELETE' });
