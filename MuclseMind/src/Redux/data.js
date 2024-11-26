import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cards: [], 
  connectionStatus: "disconnected", 
};

const dataSlice = createSlice({
  name: "projectData",
  initialState,
  reducers: {
    setCards: (state, action) => {
      state.cards = action.payload; 
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
  },
});

// Export actions and reducer
export const { setMockData, setCards, setConnectionStatus } = dataSlice.actions;
export default dataSlice.reducer;
