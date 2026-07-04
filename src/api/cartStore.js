import { create } from 'zustand';

// Load cart from sessionStorage on initialization
const loadCartFromStorage = () => {
  try {
    const savedCart = sessionStorage.getItem('rich_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from sessionStorage:', error);
    return [];
  }
};

// Save cart to sessionStorage
const saveCartToStorage = (cart) => {
  try {
    sessionStorage.setItem('rich_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to sessionStorage:', error);
  }
};

// Safely extract a numeric price from any WooCommerce product object
const extractPrice = (product) => {
  if (product.prices && product.prices.price) {
    const divisor = Math.pow(10, product.prices.currency_minor_unit || 2);
    const val = Number(product.prices.price) / divisor;
    if (!isNaN(val)) return val;
  }
  const candidates = [product.price, product.selling_price, product.sale_price, product.regular_price];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '') {
      const val = Number(c);
      if (!isNaN(val)) return val;
    }
  }
  return 0;
};

const useCartStore = create((set, get) => ({
  cart: loadCartFromStorage(),
  isCartOpen: false,
  
  // Cart actions
  addToCart: (product) => {
    const cart = get().cart;
    const existingItem = cart.find(item => item.id === product.id);
    const safePrice = extractPrice(product);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, price: safePrice, quantity: 1 }];
    }
    
    set({ cart: newCart });
    saveCartToStorage(newCart);
  },
  
  removeFromCart: (productId) => {
    const newCart = get().cart.filter(item => item.id !== productId);
    set({ cart: newCart });
    saveCartToStorage(newCart);
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
    } else {
      const newCart = get().cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      set({ cart: newCart });
      saveCartToStorage(newCart);
    }
  },
  
  clearCart: () => {
    set({ cart: [] });
    saveCartToStorage([]);
  },
  
  toggleCart: () => {
    set({ isCartOpen: !get().isCartOpen });
  },
  
  openCart: () => {
    set({ isCartOpen: true });
  },
  
  closeCart: () => {
    set({ isCartOpen: false });
  },
  
  // Computed values
  getCartTotal: () => {
    return get().cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return total + (price * qty);
    }, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  getGstAmount: () => {
    return get().getCartTotal() * 0.18;
  },

  getShippingCharge: () => {
    return get().getCartTotal() >= 1000 ? 0 : 50;
  },

  getGrandTotal: () => {
    return get().getCartTotal() + get().getGstAmount() + get().getShippingCharge();
  }
}));

export { useCartStore };
