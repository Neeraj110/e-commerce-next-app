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

const SESSION_KEY = "userState";
const isBrowser = typeof window !== "undefined";

// Utility functions
const saveStateToSession = (state: UserState) => {
  if (!isBrowser) return;

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Error saving state to sessionStorage:", err);
  }
};

const loadStateFromSession = (): UserState => {
  const defaultState = {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  if (!isBrowser) return defaultState;

  try {
    const serializedState = sessionStorage.getItem(SESSION_KEY);
    if (!serializedState) {
      return defaultState;
    }
    const parsedState = JSON.parse(serializedState);
    // Basic validation
    if (!parsedState || typeof parsedState !== "object") {
      throw new Error("Invalid session state");
    }
    return parsedState;
  } catch (err) {
    console.error("Error loading state from sessionStorage:", err);
    sessionStorage.removeItem(SESSION_KEY); // Clean up invalid state
    return defaultState;
  }
};

const initialState: UserState = loadStateFromSession();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = { ...action.payload }; // Deep copy to prevent mutations
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      saveStateToSession(state);
    },

    addAddress: (state, action: PayloadAction<Address>) => {
      if (!state.currentUser) return;

      const newAddress = { ...action.payload };
      if (newAddress.isDefault) {
        state.currentUser.addresses = state.currentUser.addresses.map(
          (addr) => ({
            ...addr,
            isDefault: false,
          })
        );
      }
      state.currentUser.addresses = [
        ...state.currentUser.addresses,
        newAddress,
      ];
      saveStateToSession(state);
    },

    removeAddress: (state, action: PayloadAction<string>) => {
      if (!state.currentUser) return;

      state.currentUser.addresses = state.currentUser.addresses.filter(
        (addr) => addr._id !== action.payload
      );
      saveStateToSession(state);
    },

    updateAddress: (
      state,
      action: PayloadAction<{ id: string; address: Partial<Address> }>
    ) => {
      if (!state.currentUser) return;

      const { id, address } = action.payload;
      const index = state.currentUser.addresses.findIndex(
        (addr) => addr._id === id
      );
      if (index === -1) return;

      if (address.isDefault) {
        state.currentUser.addresses = state.currentUser.addresses.map(
          (addr) => ({
            ...addr,
            isDefault: false,
          })
        );
      }

      state.currentUser.addresses[index] = {
        ...state.currentUser.addresses[index],
        ...address,
      };
      saveStateToSession(state);
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      if (isBrowser) {
        sessionStorage.removeItem(SESSION_KEY);
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      saveStateToSession(state);
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
      saveStateToSession(state);
    },
  },
});

export type { User, Address, UserState };

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
