import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Address {
  _id: string;
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

// Load initial state from sessionStorage
const loadStateFromSession = (): UserState => {
  try {
    const serializedState = sessionStorage.getItem("userState");
    if (serializedState === null) {
      return {
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from sessionStorage:", err);
    return {
      currentUser: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  }
};

const initialState: UserState = loadStateFromSession();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      // Save to sessionStorage
      sessionStorage.setItem("userState", JSON.stringify(state));
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
        // Save to sessionStorage
        sessionStorage.setItem("userState", JSON.stringify(state));
      }
    },

    removeAddress: (state, action: PayloadAction<number>) => {
      if (state.currentUser) {
        state.currentUser.addresses = state.currentUser.addresses.filter(
          (_, index) => index !== action.payload
        );
        // Save to sessionStorage
        sessionStorage.setItem("userState", JSON.stringify(state));
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
        // Save to sessionStorage
        sessionStorage.setItem("userState", JSON.stringify(state));
      }
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem("userState");
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      sessionStorage.setItem("userState", JSON.stringify(state));
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      sessionStorage.setItem("userState", JSON.stringify(state));
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
