// client/src/store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

const interviewSlice = createSlice({
  name: 'interview',
  initialState: {
    candidates: {}, // id -> candidate session
    currentSession: null,
  },
  reducers: {
    saveSession(state, action) {
      const { id, session } = action.payload;
      state.candidates[id] = session;
      state.currentSession = id;
    },
    updateSession(state, action) {
      const { id, patch } = action.payload;
      state.candidates[id] = {...state.candidates[id], ...patch};
    },
    setCurrentSession(state, action) {
      state.currentSession = action.payload;
    }
  }
});

const rootReducer = combineReducers({
  interview: interviewSlice.reducer
});

const persistConfig = { key: 'root', storage };

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({ reducer: persistedReducer });
export const persistor = persistStore(store);
export const { saveSession, updateSession, setCurrentSession } = interviewSlice.actions;
