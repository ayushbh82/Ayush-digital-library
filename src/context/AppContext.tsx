/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, CartItem, Order, Customer, BankDetails, PaymentGateways } from '../types.js';

export type ViewType = 
  | 'home' | 'shop' | 'product-details' | 'cart' | 'checkout'
  | 'customer-login' | 'customer-register' | 'my-library' | 'customer-dashboard'
  | 'reviews' | 'contact' | 'about-author' | 'admin-login' | 'admin-dashboard'
  | 'product-management' | 'price-management' | 'payment-settings'
  | 'bank-details' | 'analytics-dashboard' | 'customer-management' | 'orders-management';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeView: ViewType;
  setView: (view: ViewType) => void;
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  
  // Products
  books: Book[];
  refreshBooks: () => Promise<void>;
  loadingBooks: boolean;
  
  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  updateCartQuantity: (bookId: string, qty: number) => void;
  clearCart: () => void;
  wishlist: Book[];
  toggleWishlist: (book: Book) => void;
  cartTotal: number;

  // Session User
  token: string | null;
  user: { name: string; email: string; role: 'admin' | 'customer' } | null;
  loginUser: (email: string, pass: string, isAdmin: boolean) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Global settings synced from backend
  bankDetails: BankDetails | null;
  refreshBankDetails: () => Promise<void>;
  paymentSettings: PaymentGateways | null;
  refreshPaymentSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  
  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppContextType['user']>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentGateways | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem('ayush-lib-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme('light');
    }

    // Cart
    const storedCart = localStorage.getItem('ayush-lib-cart');
    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch (e) {}
    }

    // Wishlist
    const storedWishlist = localStorage.getItem('ayush-lib-wishlist');
    if (storedWishlist) {
      try { setWishlist(JSON.parse(storedWishlist)); } catch (e) {}
    }

    // Auth Token
    const storedToken = localStorage.getItem('ayush-lib-token');
    const storedUser = localStorage.getItem('ayush-lib-user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    // Fetch initial Books list
    fetchBooks();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ayush-lib-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ayush-lib-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle document class for theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ayush-lib-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setView = (view: ViewType) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Books from custom backend
  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      } else {
        showToast("Failed to sync latest books from catalog.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network failure syncing library database.", "error");
    } finally {
      setLoadingBooks(false);
    }
  };

  const refreshBooks = async () => {
    await fetchBooks();
  };

  // Cart operations
  const addToCart = (book: Book) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.book.id === book.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        showToast(`Incremented quantity for "${book.title}" in your cart!`, "info");
        return copy;
      } else {
        showToast(`Added "${book.title}" to your Shopping Cart!`, "success");
        return [...prev, { book, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => {
      const matching = prev.find(item => item.book.id === bookId);
      if (matching) {
        showToast(`Removed "${matching.book.title}" from your cart`, "info");
      }
      return prev.filter(item => item.book.id !== bookId);
    });
  };

  const updateCartQuantity = (bookId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCart(prev => prev.map(item => item.book.id === bookId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = Number(cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0).toFixed(2));

  // Wishlist operations
  const toggleWishlist = (book: Book) => {
    setWishlist(prev => {
      const hasBook = prev.some(b => b.id === book.id);
      if (hasBook) {
        showToast(`Removed "${book.title}" from your wishlist`, "info");
        return prev.filter(b => b.id !== book.id);
      } else {
        showToast(`Added "${book.title}" to your Wishlist!`, "success");
        return [...prev, book];
      }
    });
  };

  // Auth logins
  const loginUser = async (email: string, pass: string, isAdmin: boolean) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, isAdmin })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('ayush-lib-token', data.token);
        localStorage.setItem('ayush-lib-user', JSON.stringify(data.user));
        
        showToast(`Welcome back, ${data.user.name}!`, "success");
        if (data.user.role === 'admin') {
          setView('admin-dashboard');
        } else {
          setView('customer-dashboard');
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "Authentication failed" };
      }
    } catch (e) {
      return { success: false, error: "Network error. Please try again later." };
    }
  };

  const registerUser = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('ayush-lib-token', data.token);
        localStorage.setItem('ayush-lib-user', JSON.stringify(data.user));
        
        showToast(`Registration successful! Welcome to the library, ${name}!`, "success");
        setView('customer-dashboard');
        return { success: true };
      } else {
        return { success: false, error: data.error || "failed to register customer" };
      }
    } catch (e) {
      return { success: false, error: "Server connection failed" };
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ayush-lib-token');
    localStorage.removeItem('ayush-lib-user');
    showToast("Logged out of session. Come back soon!", "info");
    setView('home');
  };

  // Settings
  const refreshBankDetails = async () => {
    try {
      const res = await fetch('/api/admin/settings/bank');
      if (res.ok) {
        const data = await res.json();
        setBankDetails(data);
      }
    } catch (e) {}
  };

  const refreshPaymentSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/payments');
      if (res.ok) {
        const data = await res.json();
        setPaymentSettings(data);
      }
    } catch (e) {}
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      activeView,
      setView,
      selectedBookId,
      setSelectedBookId,
      books,
      refreshBooks,
      loadingBooks,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      wishlist,
      toggleWishlist,
      cartTotal,
      token,
      user,
      loginUser,
      registerUser,
      logoutUser,
      toasts,
      showToast,
      removeToast,
      bankDetails,
      refreshBankDetails,
      paymentSettings,
      refreshPaymentSettings
    }}>
      {children}
      
      {/* Dynamic Floating Toast Banner Panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            id={t.id}
            className={`p-4 rounded-xl shadow-lg border text-sm pointer-events-auto transition-all duration-300 transform scale-100 flex justify-between items-center animate-fade-in ${
              t.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-800' 
                : t.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-800'
                : t.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/90 dark:text-amber-200 dark:border-amber-800'
                : 'bg-indigo-50 text-indigo-800 border-indigo-100 dark:bg-indigo-950/90 dark:text-indigo-200 dark:border-indigo-800'
            }`}
          >
            <span>{t.message}</span>
            <button 
              id={`close-${t.id}`}
              onClick={() => removeToast(t.id)} 
              className="ml-3 font-bold hover:opacity-75 transition-opacity"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used inside an AppProvider context');
  }
  return context;
}
