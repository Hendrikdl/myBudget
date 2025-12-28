import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedMonth: new Date().toISOString().slice(0,7), // "December 2025"
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedMonth(state, action) {
      state.selectedMonth = action.payload;
    },
    resetUI() {
      return initialState;
    },
  },
});

export const { setSelectedMonth, resetUI } = uiSlice.actions;
export const selectSelectedMonth = (state) => state.ui.selectedMonth;

export default uiSlice.reducer;
