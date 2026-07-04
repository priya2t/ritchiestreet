import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => {
    console.log('=== USER STORE: SET USER START ===');
    console.log('User data being set:', JSON.stringify(user, null, 2));
    
    // Persist user data to localStorage
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user));
      console.log('User data saved to localStorage');
    } else {
      localStorage.removeItem('user_data');
      console.log('User data removed from localStorage');
    }
    
    set({ user, isAuthenticated: !!user });
    console.log('=== USER STORE: SET USER END ===');
  },
  
  logout: () => {
    console.log('=== USER STORE: LOGOUT START ===');
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    console.log('JWT token and user data removed from localStorage');
    console.log('=== USER STORE: LOGOUT END ===');
  },

  // Initialize authentication from localStorage
  initAuth: () => {
    console.log('=== USER STORE: INIT AUTH START ===');
    const token = localStorage.getItem('jwt_token');
    const userStr = localStorage.getItem('user_data');
    console.log('Token found:', !!token);
    console.log('User data found:', !!userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('User data loaded from localStorage:', JSON.stringify(user, null, 2));
        set({ user, isAuthenticated: true });
        console.log('User authenticated from localStorage');
      } catch (e) {
        console.error('Failed to parse user data:', e);
        localStorage.removeItem('user_data');
      }
    }
    console.log('=== USER STORE: INIT AUTH END ===');
  }
}));

export { useUserStore };
