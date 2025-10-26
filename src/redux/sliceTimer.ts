import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Session {
  duration: number;
  date: string;
}

export interface Timer {
  id: number;
  name: string;
  goalMinutes: number;
  createdAt: string;
  sessions: Session[];
}

export interface TimerState {
  timers: Timer[];
}

const initialState: TimerState = {
  timers: [],
};

export const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    addTimer: (state, action: PayloadAction<Timer>) => {
      state.timers.push(action.payload);
    },
    deleteTimer: (state, action: PayloadAction<number>) => {
      state.timers = state.timers.filter(timer => timer.id !== action.payload);
    },
    updateTimer: (state, action: PayloadAction<Timer>) => {
      const index = state.timers.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.timers[index] = action.payload;
      }
    },
  },
});

export const { addTimer, deleteTimer, updateTimer } = timerSlice.actions;

export default timerSlice.reducer;