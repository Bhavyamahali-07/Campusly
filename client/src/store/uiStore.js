import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  createPostModalOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setCreatePostModal: (open) => set({ createPostModalOpen: open }),
}));

export default useUIStore;
