import axios from 'axios';
import queryString from 'query-string';
import { LinkInterface, LinkGetQueryInterface } from 'interfaces/link';
import { GetQueryInterface, PaginatedInterface } from '../../interfaces';

export const getLinks = async (query?: LinkGetQueryInterface): Promise<PaginatedInterface<LinkInterface>> => {
  const response = await axios.get('/api/links', {
    params: query,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const createLink = async (link: LinkInterface) => {
  const response = await axios.post('/api/links', link);
  return response.data;
};

export const updateLinkById = async (id: string, link: LinkInterface) => {
  const response = await axios.put(`/api/links/${id}`, link);
  return response.data;
};

export const getLinkById = async (id: string, query?: GetQueryInterface) => {
  const response = await axios.get(`/api/links/${id}${query ? `?${queryString.stringify(query)}` : ''}`);
  return response.data;
};

export const deleteLinkById = async (id: string) => {
  const response = await axios.delete(`/api/links/${id}`);
  return response.data;
};
