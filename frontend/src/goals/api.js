import { API_BASE_URL } from '../config';
const API_URL = `${API_BASE_URL}/api`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchGoals = async () => {
  const response = await fetch(`${API_URL}/goals`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch goals');
  return response.json();
};

export const createGoal = async (goalData) => {
  const response = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(goalData),
  });
  if (!response.ok) throw new Error('Failed to create goal');
  return response.json();
};

export const updateGoal = async (id, goalData) => {
  const response = await fetch(`${API_URL}/goals/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(goalData),
  });
  if (!response.ok) throw new Error('Failed to update goal');
  return response.json();
};

export const deleteGoal = async (id) => {
  const response = await fetch(`${API_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete goal');
  return response.json();
};
