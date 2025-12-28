import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/client";

export const loadBudget = createAsyncThunk(
  "budget/load",
  async ({ year, month }) => api(`/api/budgets/${year}/${month}`)
);

export const saveBudget = createAsyncThunk(
  "budget/save",
  async ({ id, items }) =>
    api(`/api/budgets/${id}`, { method: "PUT", body: { items } })
);

const budgetSlice = createSlice({
  name: "budget",
  initialState: { current: null },
  extraReducers: (builder) => {
    builder.addCase(loadBudget.fulfilled, (state, action) => {
      state.current = action.payload;
    });
    builder.addCase(saveBudget.fulfilled, (state, action) => {
      state.current = action.payload;
    });
  },
});

export default budgetSlice.reducer;
