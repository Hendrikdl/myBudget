// Import statements - user slice for Redux
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/client";

const userFromStorage = localStorage.getItem("user");
const tokenFromStorage = localStorage.getItem("token");

const initialState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: tokenFromStorage || null,
  status: "idle",
  error: null,
  selectedMonth: "",
};

/* =========================
   AUTH THUNKS
========================= */

export const registerUser = createAsyncThunk(
  "user/register",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await api("/users/register", {
        method: "POST",
        body: { name, email, password },
      });
      return res; // should contain { user, token }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api("/users/login", {
        method: "POST",
        body: { email, password },
      });
      return res; // should contain { user, token }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMe = createAsyncThunk(
  "user/me",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      if (!token) throw new Error("Missing token");
      const res = await api("/users/me", { method: "GET", token });
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* =========================
   SLICE
========================= */

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedMonth(state, action) {
      state.selectedMonth = action.payload || "";
    },
    clearSelectedMonth(state) {
      state.selectedMonth = "";
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("user", JSON.stringify(a.payload.user));
        localStorage.setItem("token", a.payload.token);
      })
      .addCase(registerUser.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload.user;
        s.token = a.payload.token;
        localStorage.setItem("user", JSON.stringify(a.payload.user));
        localStorage.setItem("token", a.payload.token);
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload;
      })

      // FETCH ME
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload.user;
      });
  },
});

// =========================
// EXPORTS
// =========================

export const { setSelectedMonth, clearSelectedMonth, logout } =
  userSlice.actions;

export const selectSelectedMonth = (state) => state.user?.selectedMonth ?? "";
export const selectUserToken = (state) => state.user?.token ?? null;
export const selectUserStatus = (state) => state.user?.status ?? "idle";
export const selectUserError = (state) => state.user?.error ?? null;
export const selectUserProfile = (state) => state.user?.user ?? null;

export default userSlice.reducer;
