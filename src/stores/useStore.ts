import { create } from 'zustand';

interface Store {
  // Menu state
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;

  // Cursor state
  cursorVariant: 'default' | 'hover' | 'link' | 'cta' | 'drag';
  setCursorVariant: (variant: Store['cursorVariant']) => void;

  // Scroll state
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  // Menu state
  menuOpen: false,
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  closeMenu: () => set({ menuOpen: false }),

  // Cursor state
  cursorVariant: 'default',
  setCursorVariant: (variant) => set({ cursorVariant: variant }),

  // Scroll state
  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),

  // Loading state
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
