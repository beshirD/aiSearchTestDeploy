import axios from 'axios';
import queryString from 'query-string';
import { SearchInterface, SearchGetQueryInterface } from 'interfaces/search';
import { GetQueryInterface, PaginatedInterface } from '../../interfaces';

export const getSearches = async (query?: SearchGetQueryInterface): Promise<PaginatedInterface<SearchInterface>> => {
  const response = await axios.get('/api/searches', {
    params: query,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const createSearch = async (search: SearchInterface) => {
  const response = await axios.post('/api/searches', search);
  return response.data;
};

export const updateSearchById = async (id: string, search: SearchInterface) => {
  const response = await axios.put(`/api/searches/${id}`, search);
  return response.data;
};

export const getSearchById = async (id: string, query?: GetQueryInterface) => {
  const response = await axios.get(`/api/searches/${id}${query ? `?${queryString.stringify(query)}` : ''}`);
  return response.data;
};

export const deleteSearchById = async (id: string) => {
  const response = await axios.delete(`/api/searches/${id}`);
  return response.data;
};
