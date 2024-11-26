import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import dataReducer from "./data";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  Projectdata: persistReducer(persistConfig, dataReducer),
});

const store = configureStore({ reducer: rootReducer });

const persistor = persistStore(store);

export { store, persistor };