//Redux slice for Alerts
import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const alertSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    addAlert: (state, action) => {
      // Only add if alert with same id doesn't exist
      const exists = state.find((a) => a.id === action.payload.id);
      if (!exists) {
        state.push(action.payload);
      }
    },
    toggleRead: (state, action) => {
      const alert = state.find((a) => a.id === action.payload);
      if (alert) alert.read = !alert.read;
    },
    deleteAlert: (state, action) => {
      return state.filter((a) => a.id !== action.payload);
    },
    resetAlerts: () => initialState,
  },
});

export const { addAlert, toggleRead, deleteAlert, resetAlerts } =
  alertSlice.actions;

export const selectAlerts = (state) => state.alerts;
export const selectUnreadCount = (state) =>
  state.alerts.filter((a) => !a.read).length;

export default alertSlice.reducer;
