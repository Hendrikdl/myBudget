// Redux Store
import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import incomeReducer from "./incomeSlice";
import userReducer from "./userSlice"; // unified slice
import expenseReducer from "./expenseSlice";
import settingsReducer from "./settingsSlice";
import monthlyExpensesReducer from "./monthlyExpenseSlice";
import uiReducer from "./uiSlice";
import alertsReducer from "./alertSlice";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  predicate: (action) =>
    typeof action?.type === "string" && action.type.startsWith("alerts/"),
  effect: async (action, api) => {
    const alerts = api.getState().alerts.alerts;
    try {
      localStorage.setItem("alerts_v1", JSON.stringify(alerts));
    } catch (e) {
      console.error("Failed to persist alerts:", e);
    }
  },
});

export const store = configureStore({
  reducer: {
    income: incomeReducer,
    user: userReducer, // ✅ single source of truth
    expense: expenseReducer,
    alerts: alertsReducer,
    settings: settingsReducer,
    monthlyExpenses: monthlyExpensesReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(listenerMiddleware.middleware),
});

export const initAlertsFromStorage = () => (dispatch) => {
  try {
    const raw = localStorage.getItem("alerts_v1");
    if (raw) dispatch(hydrate(JSON.parse(raw)));
  } catch (e) {
    console.error("Failed to load alerts:", e);
  }
};
