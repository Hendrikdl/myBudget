
// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = localStorage.getItem('user');

const initialState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: tokenFromStorage || null,
  status: 'idle',
  error: null,
};

export const registerUser = createAsyncThunk('user/register', async ({ email, password, name }) => {
  return api('/api/users/register', { method: 'POST', body: { email, password, name } });
});

export const loginUser = createAsyncThunk('user/login', async ({ email, password }) => {
  return api('/api/users/login', { method: 'POST', body: { email, password } });
});

export const fetchMe = createAsyncThunk('user/me', async (_, { getState }) => {
  const token = getState().user.token;
  return api('/api/users/me', { token });
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(registerUser.fulfilled, (s, action) => {
        s.status = 'succeeded';
        s.user = action.payload.user;
        s.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerUser.rejected, (s, action) => { s.status = 'failed'; s.error = action.error.message; })

      // LOGIN
      .addCase(loginUser.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(loginUser.fulfilled, (s, action) => {
        s.status = 'succeeded';
        s.user = action.payload.user;
        s.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (s, action) => { s.status = 'failed'; s.error = action.error.message; })

      // ME
      .addCase(fetchMe.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchMe.fulfilled, (s, action) => {
        s.status = 'succeeded';
        s.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (s, action) => { s.status = 'failed'; s.error = action.error.message; });
  }
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
