//Import statements
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/client";
import { selectUserToken } from "./userSlice";
import { fetchExistingMonthlyExpenses } from "./monthlyExpenseSlice";

// =========================
// Async thunks
// =========================

// Fetch all expenses for the currently selected month
export const fetchExpenses = createAsyncThunk(
  "expense/fetchExpenses",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = selectUserToken(state);
      const month = state.ui.selectedMonth;

      if (!month) return { items: [], totals: {} };

      const data = await api(`/monthly-expenses/${month}`, { token });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Fetch a specific month without creating new
export const fetchMonthlyExpenses = createAsyncThunk(
  "expense/fetchMonthly",
  async (month, thunkAPI) => {
    try {
      const token = selectUserToken(thunkAPI.getState());
      const data = await api(`/monthly-expenses/${month}`, { token });
      // normalize payload
      return {
        month,
        items: data.items || [],
        totals: data.totals || { total: 0, recurring: 0, onceOff: 0 },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Add a new expense
export const addExpenseMongoDB = createAsyncThunk(
  "expense/addExpenseMongoDB",
  async (expense, thunkAPI) => {
    try {
      const token = selectUserToken(thunkAPI.getState());
      const data = await api("/monthly-expenses", {
        method: "POST",
        body: expense,
        token,
      });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Update an existing expense
export const updateExpenseMongoDB = createAsyncThunk(
  "expense/updateExpenseMongoDB",
  async ({ monthlyId, templateId, data }, thunkAPI) => {
    try {
      const token = selectUserToken(thunkAPI.getState());
      const updatedTemplate = await api(`/monthly-expenses/${monthlyId}`, {
        method: "PATCH",
        body: { templateId, data },
        token,
      });
      return updatedTemplate;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Delete an expense
export const deleteExpenseMongoDB = createAsyncThunk(
  "expense/deleteExpenseMongoDB",
  async (id, thunkAPI) => {
    try {
      const token = selectUserToken(thunkAPI.getState());
      await api(`/monthly-expenses/${id}`, { method: "DELETE", token });
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// =========================
// Slice
// =========================
const initialState = {
  monthlyId: null,
  expenses: [],
  totals: { total: 0, recurring: 0, onceOff: 0 },
  status: "idle",
  error: null,
  byMonth: {},
};

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchExpenses
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.monthlyId = action.payload.monthlyId || null;
        state.expenses = action.payload.items || [];
        state.totals = action.payload.totals || {
          total: 0,
          recurring: 0,
          onceOff: 0,
        };
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchExistingMonthlyExpenses (imported from monthlyExpenseSlice)
      .addCase(fetchExistingMonthlyExpenses.fulfilled, (state, action) => {
        const month = action.payload?.month;
        if (!month) return;
        state.byMonth[month] = {
          items: action.payload.items || [],
          totals: action.payload.totals || {
            total: 0,
            recurring: 0,
            onceOff: 0,
          },
        };
        state.status = "succeeded";
      })
      .addCase(fetchExistingMonthlyExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchMonthlyExpenses for Reports page
      .addCase(fetchMonthlyExpenses.fulfilled, (state, action) => {
        const month = action.payload.month;
        state.byMonth[month] = {
          items: action.payload.items || [],
          totals: action.payload.totals || {
            total: 0,
            recurring: 0,
            onceOff: 0,
          },
        };
        state.status = "succeeded";
      })
      .addCase(fetchMonthlyExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // addExpenseMongoDB
      .addCase(addExpenseMongoDB.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })

      // updateExpenseMongoDB
      .addCase(updateExpenseMongoDB.fulfilled, (state, action) => {
        const updated = action.payload;
        state.expenses = state.expenses.map((e) =>
          e._id === updated._id ? updated : e
        );
      })

      // deleteExpenseMongoDB
      .addCase(deleteExpenseMongoDB.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      });
  },
});

// =========================
// Selectors
// =========================
export const selectExpenseItems = (state) => state.expense?.expenses ?? [];
export const selectExpenseStatus = (state) => state.expense?.status ?? "idle";
export const selectExpenseError = (state) => state.expense?.error ?? null;
export const selectMonthlyId = (state) => state.expense?.monthlyId ?? null;
export const selectExpenseTotals = (state) =>
  state.expense?.totals ?? { total: 0, recurring: 0, onceOff: 0 };
export const selectExpenseByMonth = (month) => (state) =>
  state.expense.byMonth[month] || {
    items: [],
    totals: { total: 0, recurring: 0, onceOff: 0 },
  };

// =========================
// Export
// =========================
export default expenseSlice.reducer;
