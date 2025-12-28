import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/client";
import { selectUserToken } from "./userSlice";

/* =========================
   Fetch Settings
========================= */
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = selectUserToken(getState());
      return await api("/settings", { token });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* =========================
   Debt Templates
========================= */
export const createDebtTemplate = createAsyncThunk(
  "settings/createDebtTemplate",
  async (template, { rejectWithValue, getState }) => {
    try {
      const token = selectUserToken(getState());
      return await api("/settings/debt-templates", {
        method: "POST",
        body: template,
        token,
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateDebtTemplate = createAsyncThunk(
  "settings/updateDebtTemplate",
  async ({ templateId, ...patch }, { rejectWithValue, getState }) => {
    try {
      const token = selectUserToken(getState());
      return await api(`/settings/debt-templates/${templateId}`, {
        method: "PUT",
        body: patch,
        token,
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteDebtTemplate = createAsyncThunk(
  "settings/deleteDebtTemplate",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = selectUserToken(getState());
      await api(`/settings/debt-templates/${id}`, {
        method: "DELETE",
        token,
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* =========================
   Tolerance & Theme
========================= */
export const saveTolerance = createAsyncThunk(
  "settings/saveTolerance",
  async (tolerance, { rejectWithValue, getState }) => {
    try {
      const token = selectUserToken(getState());
      return await api("/settings/tolerance", {
        method: "PUT",
        body: { tolerance },
        token,
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveTheme = createAsyncThunk(
  "settings/saveTheme",
  async (theme, { rejectWithValue, getState }) => {
    try {
      const token = selectUserToken(getState());
      return await api("/settings", {
        method: "PUT",
        body: { theme },
        token,
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* =========================
   Slice
========================= */
const initialState = {
  theme: localStorage.getItem("theme") || "dark",
  tolerance: 25,
  debtTemplates: [],
  status: "idle",
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    /* 🔥 Instant UI update */
    setThemeLocal(state, action) {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      /* Fetch */
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { theme, tolerance, debtTemplates } = action.payload || {};

        if (theme) {
          state.theme = theme;
          localStorage.setItem("theme", theme);
        }

        if (typeof tolerance === "number") {
          state.tolerance = tolerance;
        }

        state.debtTemplates = debtTemplates || [];
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      /* Create */
      .addCase(createDebtTemplate.fulfilled, (state, action) => {
        state.debtTemplates.push(action.payload);
      })

      /* Update */
      .addCase(updateDebtTemplate.fulfilled, (state, action) => {
        const idx = state.debtTemplates.findIndex(
          (t) => t._id === action.payload._id
        );
        if (idx !== -1) {
          state.debtTemplates[idx] = action.payload;
        }
      })

      /* Delete */
      .addCase(deleteDebtTemplate.fulfilled, (state, action) => {
        state.debtTemplates = state.debtTemplates.filter(
          (t) => t._id !== action.payload
        );
      })

      /* Tolerance */
      .addCase(saveTolerance.fulfilled, (state, action) => {
        state.tolerance = action.payload.tolerance;
      })

      /* Theme (backend sync) */
      .addCase(saveTheme.fulfilled, (state, action) => {
        if (action.payload?.theme) {
          state.theme = action.payload.theme;
          localStorage.setItem("theme", action.payload.theme);
        }
      });
  },
});

/* =========================
   Exports
========================= */
export const { setThemeLocal } = settingsSlice.actions;

export const selectTheme = (state) => state.settings.theme;
export const selectTolerance = (state) => state.settings.tolerance;
export const selectDebtTemplates = (state) => state.settings.debtTemplates;
export const selectSettingsStatus = (state) => state.settings.status;
export const selectSettingsError = (state) => state.settings.error;

export default settingsSlice.reducer;
