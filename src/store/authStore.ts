import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userRole: 'client' | 'host' | null;
  userEmail: string | null;
  userId: string | null;
  isConnecting: boolean;
  paymentMethod: 'crypto' | 'card';
  balance: number;
  walletConnected: boolean;
  walletAddress: string | null;
  setUserRole: (role: 'client' | 'host' | null) => void;
  setUserEmail: (email: string | null) => void;
  setUserId: (id: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setPaymentMethod: (method: 'crypto' | 'card') => void;
  setBalance: (balance: number) => void;
  addToBalance: (amount: number) => void;
  setWalletConnected: (connected: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userRole: null,
      userEmail: null,
      userId: null,
      isConnecting: false,
      paymentMethod: 'crypto',
      balance: 0,
      walletConnected: false,
      walletAddress: null,
      setUserRole: (role) => set({ userRole: role }),
      setUserEmail: (email) => set({ userEmail: email }),
      setUserId: (id) => set({ userId: id }),
      setIsConnecting: (isConnecting) => set({ isConnecting }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setBalance: (balance) => set({ balance }),
      addToBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
      setWalletConnected: (connected) => set({ walletConnected: connected }),
      setWalletAddress: (address) => set({ walletAddress: address }),
      logout: () => set({ 
        userRole: null, 
        userEmail: null,
        userId: null,
        balance: 0, 
        walletConnected: false,
        walletAddress: null
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);