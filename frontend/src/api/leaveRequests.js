import { apiRequest } from './client';

export const getLeaveRequests = status => apiRequest(`/leave-requests${status ? `?status=${status}` : ''}`);
export const createLeaveRequest = request => apiRequest('/leave-requests', { method: 'POST', body: JSON.stringify(request) });
export const updateLeaveRequestStatus = (id, status) => apiRequest(`/leave-requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
