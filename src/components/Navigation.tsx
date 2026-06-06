/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { 
  BookOpen, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldAlert, 
  LogOut, 
  Sliders, 
  UserCircle 
} from 'lucide-react';

export default function Navigation() {
  const { 
    theme, 
    toggleTheme, 
    activeView, 
    setView, 
    cart, 
    wishlist, 
    user, 
    logoutUser 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to highlight active menu tabs
  const isTabActive = (views: string[]) => {
    return views.includes(activeView) ? "text-emerald-400 font-semibold" : "text-slate-350 hover:text-emerald-400 transition-colors";
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavClick = (view: any) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav id="app-navigation-bar" className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Brand Title */}
          <div className="flex items-center">
            <button 
              id="nav-logo-btn"
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-2 text-left group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-sans text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                  Ayush's
                </span>
                <span className="block text-xs font-mono tracking-widest text-emerald-400 -mt-1 uppercase">
                  Digital Library
                </span>
              </div>
            </button>
          </div>

          {/* Large Screen Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              id="nav-link-home"
              onClick={() => handleNavClick('home')} 
              className={`text-sm ${isTabActive(['home'])} cursor-pointer`}
            >
              Home
            </button>
            <button 
              id="nav-link-shop"
              onClick={() => handleNavClick('shop')} 
              className={`text-sm ${isTabActive(['shop', 'product-details'])} cursor-pointer`}
            >
              eBooks Shop
            </button>
            <button 
              id="nav-link-reviews"
              onClick={() => handleNavClick('reviews')} 
              className={`text-sm ${isTabActive(['reviews'])} cursor-pointer`}
            >
              Reviews
            </button>
            <button 
              id="nav-link-about"
              onClick={() => handleNavClick('about-author')} 
              className={`text-sm ${isTabActive(['about-author'])} cursor-pointer`}
            >
              About Author
            </button>
            <button 
              id="nav-link-contact"
              onClick={() => handleNavClick('contact')} 
              className={`text-sm ${isTabActive(['contact'])} cursor-pointer`}
            >
              Contact
            </button>
          </div>

          {/* Desktop Right Settings Utility */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist Icon */}
            <button
              id="wishlist-btn-nav"
              onClick={() => handleNavClick(user ? 'customer-dashboard' : 'customer-login')}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 relative transition-colors cursor-pointer"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}

            <button
              id="cart-btn-nav"
              onClick={() => handleNavClick('cart')}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-slate-200 relative transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-emerald-500 text-[9px] text-zinc-950 font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Vertical Split Line */}
            <div className="h-6 w-px bg-white/10" />

            {/* Auth Dynamic Menu Action */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' ? (
                  <button
                    id="nav-admin-dash"
                    onClick={() => handleNavClick('admin-dashboard')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    Owner Panel
                  </button>
                ) : (
                  <button
                    id="nav-cust-dash"
                    onClick={() => handleNavClick('customer-dashboard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5 text-xs font-semibold tracking-wide transition-all cursor-pointer"
                  >
                    <UserCircle className="h-3.5 w-3.5" />
                    My Library
                  </button>
                )}
                
                <button
                  id="nav-logout"
                  onClick={logoutUser}
                  className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login"
                  onClick={() => handleNavClick('customer-login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="nav-register"
                  onClick={() => handleNavClick('customer-register')}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Register
                </button>
                <button
                  id="nav-admin"
                  onClick={() => handleNavClick('admin-login')}
                  className="p-2 rounded-lg hover:bg-white/5 text-amber-400 cursor-pointer"
                  title="Author Portal"
                >
                  <ShieldAlert className="h-4 w-4" />
                </button>
              </div>
            )}

          </div>

          {/* Mobile responsive toggle */}
          <div className="flex items-center md:hidden gap-2">
            <button
              id="theme-toggle-btn-mob"
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              id="mob-cart-nav"
              onClick={() => handleNavClick('cart')}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-indigo-600 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-650 dark:text-gray-300 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden glass-card border-b border-white/10 transition-colors py-4 px-4 space-y-3 animate-fade-in mx-2 mt-1 rounded-2xl">
          <div className="flex flex-col gap-2">
            <button
              id="mob-link-home"
              onClick={() => handleNavClick('home')}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm ${activeView === 'home' ? 'bg-white/10 text-emerald-400 font-semibold' : 'text-slate-350 hover:text-emerald-400'}`}
            >
              Home
            </button>
            <button
              id="mob-link-shop"
              onClick={() => handleNavClick('shop')}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm ${activeView === 'shop' ? 'bg-white/10 text-emerald-400 font-semibold' : 'text-slate-350 hover:text-emerald-400'}`}
            >
              eBooks Shop
            </button>
            <button
              id="mob-link-reviews"
              onClick={() => handleNavClick('reviews')}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm ${activeView === 'reviews' ? 'bg-white/10 text-emerald-400 font-semibold' : 'text-slate-350 hover:text-emerald-400'}`}
            >
              Reviews
            </button>
            <button
              id="mob-link-about"
              onClick={() => handleNavClick('about-author')}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm ${activeView === 'about-author' ? 'bg-white/10 text-emerald-400 font-semibold' : 'text-slate-350 hover:text-emerald-400'}`}
            >
              About Author
            </button>
            <button
              id="mob-link-contact"
              onClick={() => handleNavClick('contact')}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm ${activeView === 'contact' ? 'bg-white/10 text-emerald-400 font-semibold' : 'text-slate-350 hover:text-emerald-400'}`}
            >
              Contact
            </button>
          </div>

          <div className="h-px bg-white/10 my-2" />

          <div className="flex flex-wrap items-center gap-2">
            {user ? (
              <div className="w-full flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-205">
                    {user.name} ({user.role})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {user.role === 'admin' ? (
                    <button
                      id="mob-btn-admin"
                      onClick={() => handleNavClick('admin-dashboard')}
                      className="px-2.5 py-1 text-[11px] bg-emerald-500 text-zinc-950 font-bold rounded"
                    >
                      Console
                    </button>
                  ) : (
                    <button
                      id="mob-btn-lib"
                      onClick={() => handleNavClick('customer-dashboard')}
                      className="px-2.5 py-1 border border-white/10 text-[11px] text-slate-300 rounded hover:bg-white/5"
                    >
                      My Library
                    </button>
                  )}
                  <button
                    id="mob-btn-logout"
                    onClick={logoutUser}
                    className="p-1 px-2 rounded bg-rose-500/20 text-rose-350 text-xs font-bold border border-rose-500/30"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="mob-btn-login"
                    onClick={() => handleNavClick('customer-login')}
                    className="text-center py-2 border border-white/10 rounded-lg text-xs font-semibold text-slate-300"
                  >
                    Sign In
                  </button>
                  <button
                    id="mob-btn-register"
                    onClick={() => handleNavClick('customer-register')}
                    className="text-center py-2 bg-emerald-505 hover:bg-emerald-600 text-zinc-950 font-bold rounded-lg text-xs"
                  >
                    Register
                  </button>
                </div>
                <button
                  id="mob-btn-author-portal"
                  onClick={() => handleNavClick('admin-login')}
                  className="w-full text-center py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg text-[11px] font-semibold"
                >
                  Author / Admin Login Portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
