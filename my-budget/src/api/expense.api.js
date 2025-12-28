import  api  from './client';

export const createExpense = (data, token) =>
  api('/api/expenses', {
    method: 'POST',
    body: data,
    token,
  });

export const fetchExpenses = (token) =>
  api('/api/expenses', { token });

export const updateExpenseById = (id, patch, token) =>
  api(`/api/expenses/${id}`, {
    method: 'PATCH',
    body: patch,
    token,
  });

export const deleteExpenseById = (id, token) =>
  api(`/api/expenses/${id}`, {
    method: 'DELETE',
    token,
  });
