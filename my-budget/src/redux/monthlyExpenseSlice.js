// Redux monthly expenses slice
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Helper to get user token from state
const selectToken = (state) => state.user?.token;

// Helper for auth headers
const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// =========================
// ASYNC THUNKS
// =========================

// Load monthly expenses for a selected month (creates if not exist)
export const loadMonthlyExpenses = createAsyncThunk(
  "monthlyExpenses/load",
  async ({ month }, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      if (!token) return rejectWithValue("Missing auth token");

      const res = await fetch(`${API_BASE}/monthly-expenses/${month}`, {
        method: "GET",
        headers: authHeaders(token),
        credentials: "include",
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to load monthly expenses");
      }

      return await res.json(); // { items: [...], totals: {...} }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchExistingMonthlyExpenses = createAsyncThunk(
  "monthlyExpenses/fetchExisting",
  async (month, { getState, rejectWithValue }) => {
    // HARD GUARD — stops undefined forever
    if (!month || typeof month !== "string") {
      return rejectWithValue("Month is required");
    }

    const token = selectToken(getState());
    if (!token) return rejectWithValue("Missing auth token");

    const res = await fetch(`${API_BASE}/monthly-expenses/${month}`, {
      method: "GET",
      headers: authHeaders(token),
      credentials: "include",
    });

    if (!res.ok) return rejectWithValue("Month not found");

    const data = await res.json();
    return { month, ...data };
  }
);

// Update monthly expense (PATCH)
export const updateMonthlyExpense = createAsyncThunk(
  "monthlyExpenses/update",
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      if (!token) return rejectWithValue("Missing auth token");

      const res = await fetch(`${API_BASE}/monthly-expenses/${id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update monthly expense");
      }

      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// =========================
// SLICE
// =========================
const initialState = {
  items: [],
  totals: { total: 0, recurring: 0, onceOff: 0 },
  status: "idle",
  error: null,
  byMonth: {}, // for Reports
};

const monthlyExpenseSlice = createSlice({
  name: "monthlyExpenses",
  initialState,
  reducers: {
    resetMonthlyExpenses(state) {
      state.items = [];
      state.totals = { total: 0, recurring: 0, onceOff: 0 };
      state.status = "idle";
      state.error = null;
      state.byMonth = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // loadMonthlyExpenses
      .addCase(loadMonthlyExpenses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadMonthlyExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.totals = action.payload.totals;
      })
      .addCase(loadMonthlyExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchExistingMonthlyExpenses
      .addCase(fetchExistingMonthlyExpenses.pending, (state) => {
        state.status = "loading";
      })
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

      // updateMonthlyExpense
      .addCase(updateMonthlyExpense.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) state.items[index] = action.payload;

        // recalc totals
        state.totals = {
          total: state.items.reduce(
            (sum, i) => sum + Number(i.amountOverride ?? i.amount),
            0
          ),
          recurring: state.items
            .filter((i) => i.isRecurring)
            .reduce((sum, i) => sum + Number(i.amountOverride ?? i.amount), 0),
          onceOff: state.items
            .filter((i) => !i.isRecurring)
            .reduce((sum, i) => sum + Number(i.amountOverride ?? i.amount), 0),
        };
      });
  },
});

// =========================
// HELPER: Check Tolerance
// =========================
export const checkToleranceAlert = (
  state,
  currentMonth,
  prevMonth,
  tolerance = 0
) => {
  const currentItems =
    state[currentMonth]?.items || state.byMonth?.[currentMonth]?.items || [];
  const prevItems =
    state[prevMonth]?.items || state.byMonth?.[prevMonth]?.items || [];

  const alerts = [];

  currentItems.forEach((curr) => {
    const prev = prevItems.find((p) => p.name === curr.name);
    if (!prev) return;

    const prevAmount = Number(prev.amountOverride ?? prev.amount);
    const currAmount = Number(curr.amountOverride ?? curr.amount);

    const diffPercent = Math.abs((currAmount - prevAmount) / prevAmount) * 100;

    if (diffPercent > tolerance) {
      alerts.push({
        name: curr.name,
        prevAmount,
        currAmount,
        diffPercent: diffPercent.toFixed(2),
      });
    }
  });

  return alerts;
};

// =========================
// EXPORTS
// =========================
export const { resetMonthlyExpenses } = monthlyExpenseSlice.actions;

export const selectMonthlyExpenses = (state) => state.monthlyExpenses.items;
export const selectMonthlyTotals = (state) => state.monthlyExpenses.totals;
export const selectMonthlyByMonth = (state) => state.monthlyExpenses.byMonth;

export default monthlyExpenseSlice.reducer;
