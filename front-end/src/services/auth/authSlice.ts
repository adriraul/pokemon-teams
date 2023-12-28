import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("userToken"),
  isAuthenticated: !!localStorage.getItem("userToken"),
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("userToken", action.payload);
    },
    logoutSuccess: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("userToken");
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { loginSuccess, logoutSuccess, setIsLoading } = authSlice.actions;
export default authSlice.reducer;
