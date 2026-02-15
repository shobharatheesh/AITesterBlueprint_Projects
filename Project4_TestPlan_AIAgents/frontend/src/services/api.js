import axios from 'axios';

const api = axios.create({
    baseURL: '/api/testplan',
});

export const fetchTicket = async (ticketKey) => {
    const response = await api.post('/fetch', { ticket_key: ticketKey });
    return response.data;
};

export const generatePlan = async (ticketData, template = '') => {
    const response = await api.post('/generate', { ticket_data: ticketData, template });
    return response.data;
};

export default api;
