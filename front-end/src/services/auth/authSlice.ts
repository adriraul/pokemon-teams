import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  balance: string | null;
  avatar: string | null;
  username: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("userToken"),
  isAuthenticated: !!localStorage.getItem("userToken"),
  isLoading: false,
  balance: localStorage.getItem("userBalance"),
  avatar: localStorage.getItem("userAvatar"),
  username: localStorage.getItem("username"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        userAvatar: string;
        username: string;
      }>
    ) => {
      state.token = action.payload.token;
      state.avatar = action.payload.userAvatar;
      state.username = action.payload.username;
      state.isAuthenticated = true;
      localStorage.setItem("userToken", action.payload.token);
      localStorage.setItem("userAvatar", action.payload.userAvatar);
      localStorage.setItem("username", action.payload.username);
    },
    logoutSuccess: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("userToken");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("username");
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
      localStorage.setItem("userBalance", action.payload);
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
      localStorage.setItem("userAvatar", action.payload);
    },
  },
});

export const {
  loginSuccess,
  logoutSuccess,
  setIsLoading,
  updateBalance,
  updateAvatar,
} = authSlice.actions;
export default authSlice.reducer;
