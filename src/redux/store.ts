import { Action, Dispatch, configureStore } from "@reduxjs/toolkit";
import pageReducer from "./slicePage";
import timerReducer from "./sliceTimer";

export const KEY_LOCALSTORAGE = "app-state-pwa-timer"

const localStorageMiddleware = ({ getState }: { getState: () => any }) => {
  return (next: Dispatch) => (action: Action) => {
    const result = next(action);
    localStorage.setItem(KEY_LOCALSTORAGE, JSON.stringify(getState()));
    return result;
  };
};

const reHydrateStore = () => {
  let strJson = "{}";
  strJson = localStorage.getItem(KEY_LOCALSTORAGE) || "{}";
  return JSON.parse(strJson);
};

export const store = configureStore({
  reducer: {
    page: pageReducer,
    timer: timerReducer,
  },
  preloadedState: reHydrateStore(),
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
