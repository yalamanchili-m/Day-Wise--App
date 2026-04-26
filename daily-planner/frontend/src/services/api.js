import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Daily Planner APIs
export const dailyAPI = {
  // Tasks
  getTasks: (date) => api.get(`/tasks?target_date=${date}`),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  
  // Notes
  getNotes: () => api.get('/notes'),
  createNote: (content) => api.post('/notes', { content }),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  
  // Trackers
  getTrackers: () => api.get('/trackers'),
  updateTracker: (data) => api.post('/trackers', data),
};

// Finance APIs
export const financeAPI = {
  // Expenses
  getExpenses: (startDate, endDate) => {
    let url = '/finance/expenses';
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return api.get(url);
  },
  addExpense: (expense) => api.post('/finance/expenses', expense),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  getCategories: () => api.get('/finance/expenses/categories'),
  
  // Income
  getIncome: (startDate, endDate) => {
    let url = '/finance/income';
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return api.get(url);
  },
  addIncome: (income) => api.post('/finance/income', income),
  
  // Budgets
  getBudgets: (month) => api.get(`/finance/budgets/${month}`),
  setBudget: (budget) => api.post('/finance/budgets', budget),
  getSummary: (month) => api.get(`/finance/budgets/summary/${month}`),
};

export default api;