import axios from 'axios';

const API_BASE = "https://opd-token-engine-gq1z.onrender.com/api"; 

const api = axios.create({
    baseURL: API_BASE,
});

export const getDoctorStatus = (id) => api.get(`/status/${id}`);
export const bookToken = (data) => api.post('/book', data);
export const cancelToken = (data) => api.post('/cancel', data);

export default api;