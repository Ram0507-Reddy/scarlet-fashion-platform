import { create } from 'zustand';

interface UiState {
    isCartOpen: boolean;
    isMobileMenuOpen: boolean;
    toggleCart: () => void;
    toggleMobileMenu: () => void;
    closeCart: () => void;
    closeMobileMenu: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    isCartOpen: false,
    isMobileMenuOpen: false,
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    closeCart: () => set({ isCartOpen: false }),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
