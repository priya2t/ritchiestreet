import { create } from 'zustand';

const cleanEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const lower = email.toLowerCase();
  if (
    lower.includes('@richreact.local') ||
    lower.includes('@ritchiestreet.co.in') ||
    lower.includes('temp_') ||
    lower.startsWith('notspecified_')
  ) {
    return '';
  }
  return email;
};

const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => {
    console.log('=== USER STORE: SET USER START ===');
    console.log('User data being set:', JSON.stringify(user, null, 2));

    // Clean any placeholder emails before storing
    const cleanedUser = user ? {
      ...user,
      email: cleanEmail(user.email),
      billing_email: cleanEmail(user.billing_email),
      shipping_email: cleanEmail(user.shipping_email)
    } : user;

    // Persist user data to localStorage
    if (cleanedUser) {
      localStorage.setItem('user_data', JSON.stringify(cleanedUser));
      console.log('User data saved to localStorage');
    } else {
      localStorage.removeItem('user_data');
      console.log('User data removed from localStorage');
    }

    set({ user: cleanedUser, isAuthenticated: !!cleanedUser });
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
        const cleanedUser = {
          ...user,
          email: cleanEmail(user.email),
          billing_email: cleanEmail(user.billing_email),
          shipping_email: cleanEmail(user.shipping_email)
        };
        console.log('User data loaded from localStorage:', JSON.stringify(cleanedUser, null, 2));
        set({ user: cleanedUser, isAuthenticated: true });
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
