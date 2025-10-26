import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Session {
  duration?: number;
  date: string;
  startTime: string;
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
      const timer = {
        ...action.payload,
        sessions: action.payload.sessions || []
      };
      state.timers.push(timer);
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
    addSession: (state, action: PayloadAction<{ timerId: number; session: Session }>) => {
      const timer = state.timers.find(t => t.id === action.payload.timerId);
      if (timer) {
        if (!timer.sessions) {
          timer.sessions = [];
        }
        timer.sessions.push(action.payload.session);
      }
    },
  },
});

export const { addTimer, deleteTimer, updateTimer, addSession } = timerSlice.actions;

export default timerSlice.reducer;