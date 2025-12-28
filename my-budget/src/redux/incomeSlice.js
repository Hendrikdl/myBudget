// Import statements
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/client";

// Selector for user token
const selectToken = (state) => state.user?.token;

/* =======================
   Async Thunks
======================= */

// Fetch all incomes
export const fetchIncomes = createAsyncThunk(
  "income/fetchIncomes",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      if (!token) return rejectWithValue("Missing auth token");

      return await api("/income", { token });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Add income
export const addIncomeMongoDB = createAsyncThunk(
  "income/addIncomeMongoDB",
  async (payload, { getState, rejectWithValue }) => {
    console.log(payload);
    try {
      const token = selectToken(getState());
      if (!token) return rejectWithValue("Missing auth token");

      return await api("/income", { method: "POST", body: payload, token });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update income
export const updateIncomeMongoDB = createAsyncThunk(
  "income/updateIncomeMongoDB",
  async ({ id, patch }, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      if (!token) return rejectWithValue("Missing auth token");

      return await api(`/income/${id}`, { method: "PUT", body: patch, token });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete income
export const deleteIncomeMongoDB = createAsyncThunk(
  "income/deleteIncomeMongoDB",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      if (!token) return rejectWithValue("Missing auth token");

      await api(`/income/${id}`, { method: "DELETE", token });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* =======================
   Slice
======================= */

const incomeSlice = createSlice({
  name: "income",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    total: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchIncomes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
        state.total = state.items.reduce(
          (sum, i) => sum + (Number(i.amount) || 0),
          0
        );
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addIncomeMongoDB.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.total += Number(action.payload.amount) || 0;
      })

      // Update
      .addCase(updateIncomeMongoDB.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) {
          state.total -= Number(state.items[idx].amount) || 0;
          state.items[idx] = action.payload;
          state.total += Number(action.payload.amount) || 0;
        }
      })

      // Delete
      .addCase(deleteIncomeMongoDB.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i._id === action.payload);
        if (idx !== -1) {
          state.total -= Number(state.items[idx].amount) || 0;
          state.items.splice(idx, 1);
        }
      });
  },
});

/* =======================
   Selectors
======================= */

export const selectIncomeItems = (state) => state.income.items;
export const selectTotalIncome = (state) => state.income.total;

/* =======================
   Export
======================= */

//  Default export for store
export default incomeSlice.reducer;
