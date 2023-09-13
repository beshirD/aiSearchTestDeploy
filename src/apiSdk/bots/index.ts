import axios from 'axios';
import queryString from 'query-string';
import { BotInterface, BotGetQueryInterface } from 'interfaces/bot';
import { GetQueryInterface, PaginatedInterface } from '../../interfaces';

export const getBots = async (query?: BotGetQueryInterface): Promise<PaginatedInterface<BotInterface>> => {
  const response = await axios.get('/api/bots', {
    params: query,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const createBot = async (bot: BotInterface) => {
  const response = await axios.post('/api/bots', bot);
  return response.data;
};

export const updateBotById = async (id: string, bot: BotInterface) => {
  const response = await axios.put(`/api/bots/${id}`, bot);
  return response.data;
};

export const getBotById = async (id: string, query?: GetQueryInterface) => {
  const response = await axios.get(`/api/bots/${id}${query ? `?${queryString.stringify(query)}` : ''}`);
  return response.data;
};

export const deleteBotById = async (id: string) => {
  const response = await axios.delete(`/api/bots/${id}`);
  return response.data;
};
