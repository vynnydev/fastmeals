import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  darkMode: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  darkMode: true, // FastMeals default is dark

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode
      if (newMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { darkMode: newMode }
    }),
}))