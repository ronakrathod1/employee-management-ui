import { apiRequest } from './client';

export const getEmployees = () => apiRequest('/employees');
export const createEmployee = employee => apiRequest('/employees', { method: 'POST', body: JSON.stringify(employee) });
export const updateEmployee = (id, employee) => apiRequest(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employee) });
export const deleteEmployee = id => apiRequest(`/employees/${id}`, { method: 'DELETE' });
