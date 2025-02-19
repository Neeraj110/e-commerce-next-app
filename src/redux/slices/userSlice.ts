import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  addresses: Address[];
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    addAddress: (state, action: PayloadAction<Address>) => {
      if (state.currentUser) {
        if (action.payload.isDefault) {
          state.currentUser.addresses = state.currentUser.addresses.map(
            (addr) => ({
              ...addr,
              isDefault: false,
            })
          );
        }
        state.currentUser.addresses.push(action.payload);
      }
    },

    removeAddress: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        state.currentUser.addresses = state.currentUser.addresses.filter(
          (_, index) => index !== action.payload
        );
      }
    },

    updateAddress: (
      state,
      action: PayloadAction<{ index: number; address: Address }>
    ) => {
      if (state.currentUser) {
        const { index, address } = action.payload;
        if (address.isDefault) {
          state.currentUser.addresses = state.currentUser.addresses.map(
            (addr) => ({
              ...addr,
              isDefault: false,
            })
          );
        }
        state.currentUser.addresses[index] = address;
      }
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  addAddress,
  removeAddress,
  updateAddress,
  logout,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
