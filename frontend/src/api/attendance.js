import { apiRequest } from './client';

export const getAttendance = date => apiRequest(`/attendance?date=${date}`);
export const markAttendance = record => apiRequest('/attendance', { method: 'POST', body: JSON.stringify(record) });
export const getAttendanceSummary = date => apiRequest(`/attendance/summary?date=${date}`);
