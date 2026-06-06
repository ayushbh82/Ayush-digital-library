/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { BookCover } from './Storefront.js';
import { 
  User, 
  Mail, 
  Lock, 
  BookOpen, 
  Download, 
  ShieldCheck, 
  Heart, 
  CreditCard,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function CustomerPortal() {
  const { 
    activeView, 
    setView, 
    user, 
    loginUser, 
    registerUser, 
    logoutUser, 
    books, 
    wishlist, 
    refreshBooks,
    showToast 
  } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Authentication Submission Routing
  const handleAuthSubmit = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password.trim()) {
      setAuthError("All credentials must be supplied");
      return;
    }

    setSubmitting(true);
    try {
      if (type === 'login') {
        const res = await loginUser(email, password, false);
        if (!res.success) {
          setAuthError(res.error || "Login details invalid.");
        } else {
          showToast(`Welcome back, ${res.user?.name || "Reader"}!`, "success");
        }
      } else {
        if (!name.trim()) {
          setAuthError("Name is required for profile registration.");
          setSubmitting(false);
          return;
        }
        const res = await registerUser(name, email, password);
        if (!res.success) {
          setAuthError(res.error || "Registration issue occurred. Try another email.");
        } else {
          showToast("Profile registered successfully!", "success");
        }
      }
    } catch (e) {
      setAuthError("Server communication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Retrieve lists of books owned by logged-in customer state or session
  const getPurchasedBooks = () => {
    if (!user) return [];
    
    // In our JSON database mock system, we can verify either profile attributes 
    // or retrieve stored purchases from local storage profile state.
    const localStorageUserObj = JSON.parse(localStorage.getItem('ayush-lib-user') || '{}');
    const ownedIds = localStorageUserObj.purchasedBookIds || [];
    
    // If user is freshly logged in as Guest Demo, ensure they have at least 1 book for demonstration
    const list = books.filter(b => ownedIds.includes(b.id));
    if (list.length === 0 && books.length > 0) {
      // Gifting first book for live sandbox interaction
      return [books[0]];
    }
    return list;
  };

  const ownedBooks = getPurchasedBooks();

  // LOGIN PAGE CARD
  if (activeView === 'customer-login') {
    return (
      <div className="max-w-md mx-auto py-12 animate-fade-in text-left">
        <div className="glass-card border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-50 tracking-tight pt-2">Sign In to Your Account</h2>
            <p className="text-xs text-slate-400">Unlock your digital library bookshelf and download certificates.</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/20 flex items-center gap-1.5 font-mono">
              <span>⚠</span> {authError}
            </div>
          )}

          <form onSubmit={(e) => handleAuthSubmit(e, 'login')} className="space-y-4">
            <div>
              <label id="lbl-login-email" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-450 pointer-events-none" />
                <input
                  id="login-email-field"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-sans pl-10 pr-4 py-3 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label id="lbl-login-pass" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Account Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-450 pointer-events-none" />
                <input
                  id="login-pass-field"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-sans pl-10 pr-4 py-3 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[10px] text-slate-450 block mt-1">First-time visitors: type any password to auto-generate a demo account!</span>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer font-mono shadow-md shadow-emerald-500/10"
            >
              {submitting ? "Signing in safely..." : "Sign In & Unlock Library"}
            </button>
          </form>

          <div className="h-px bg-white/5 my-4" />

          <div className="text-center text-xs text-slate-400 space-y-2">
            <p>
              Don't have an account yet?{' '}
              <button onClick={() => setView('customer-register')} className="font-extrabold text-emerald-400 text-xs hover:underline cursor-pointer">
                Create Reader Account
              </button>
            </p>
            <button onClick={() => setView('admin-login')} className="block mx-auto text-[10px] font-bold font-mono text-amber-500 hover:underline cursor-pointer">
              Access Author/Admin Dashboard Portal (Ayush) &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REGISTER PAGE CARD
  if (activeView === 'customer-register') {
    return (
      <div className="max-w-md mx-auto py-12 animate-fade-in text-left">
        <div className="glass-card border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-50 tracking-tight pt-2">Create Reader Profile</h2>
            <p className="text-xs text-slate-400">Join Ayush's Library to manage eBooks and sync invoices.</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-500/20 flex items-center gap-1.5 font-mono">
              <span>⚠</span> {authError}
            </div>
          )}

          <form onSubmit={(e) => handleAuthSubmit(e, 'register')} className="space-y-4">
            <div>
              <label id="lbl-reg-name" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-450 pointer-events-none" />
                <input
                  id="register-name-field"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-sans pl-10 pr-4 py-3 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label id="lbl-reg-email" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Deliverability License Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-450 pointer-events-none" />
                <input
                  id="register-email-field"
                  type="email"
                  required
                  placeholder="jane.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-sans pl-10 pr-4 py-3 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label id="lbl-reg-pass" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Secure Account Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-450 pointer-events-none" />
                <input
                  id="register-pass-field"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-sans pl-10 pr-4 py-3 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold rounded-xl text-xs transition-colors cursor-pointer font-mono"
            >
              {submitting ? "Processing Account..." : "Create Account & Sign In"}
            </button>
          </form>

          <div className="h-px bg-white/5" />

          <p className="text-center text-xs text-slate-400">
            Already have an active account?{' '}
            <button onClick={() => setView('customer-login')} className="font-extrabold text-emerald-400 text-xs hover:underline cursor-pointer">
              Login to bookshelf
            </button>
          </p>
        </div>
      </div>
    );
  }

  // IF ANONYMOUS SESSIONS TRY TO BROWSE SECURE DIRECTORIES, DIVERT TO SIGN-IN
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4 animate-fade-in font-sans">
        <ShieldCheck className="h-12 w-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-200">Secure Area Authorization Check</h2>
        <p className="text-xs text-slate-400">You must authorize or create an account to view and download purchases.</p>
        <div className="pt-2 flex flex-col gap-2 font-mono">
          <button 
            id="redirect-to-login"
            onClick={() => setView('customer-login')} 
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer"
          >
            Access Login Cards
          </button>
          <button 
            id="redirect-to-register"
            onClick={() => setView('customer-register')} 
            className="text-xs text-slate-450 hover:underline cursor-pointer"
          >
            Register new account
          </button>
        </div>
      </div>
    );
  }

  // CUSTOMER LIBRARY BOOKSHELF VIEW
  if (activeView === 'my-library') {
    return (
      <div className="space-y-8 py-4 animate-fade-in text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-50 flex items-center gap-2">
              <BookOpen className="text-emerald-405 h-6 w-6" />
              My Digital Library Bookshelf
            </h1>
            <p className="text-xs text-slate-400">Your secure digital assets and printable study guides are compiled below.</p>
          </div>
          <button
            id="lib-dash-toggle"
            onClick={() => setView('customer-dashboard')}
            className="px-4 py-2 border border-white/10 text-xs font-bold font-mono text-slate-300 hover:bg-white/5 rounded-xl cursor-pointer transition-all"
          >
            Go to Account Dashboard &rarr;
          </button>
        </div>

        {ownedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedBooks.map(book => (
              <div 
                key={book.id}
                className="flex gap-4 p-5 glass-card border border-white/10 rounded-2xl shadow-xl hover:shadow-2xl transition-all relative"
              >
                <div className="flex-shrink-0">
                  <BookCover title={book.title} category={book.category} size="sm" />
                </div>

                <div className="flex-grow flex flex-col justify-between text-left space-y-2">
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold font-mono tracking-widest text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                      {book.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Size: {book.fileSize} / {book.pages} p.</p>
                  </div>

                  <div className="pt-2">
                    {/* SECURE DYNAMIC STREAM DOWNLOAD ATTACHMENT */}
                    <a
                      id={`lib-secure-download-${book.id}`}
                      href={`/api/download/${book.id}?email=${user.email}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md font-mono"
                    >
                      <Download className="h-3.5 w-3.5 text-zinc-950" />
                      Download secure PDF
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div id="no-library-books" className="py-20 text-center space-y-4 border border-dashed border-white/10 rounded-2xl glass-card">
            <BookOpen className="h-12 w-12 text-slate-550 mx-auto" />
            <div>
              <h3 className="font-bold text-sm text-slate-201">Bookshelf empty</h3>
              <p className="text-xs text-slate-400">You haven't bought any manuals under this login session yet.</p>
            </div>
            <button 
              id="lib-go-shop"
              onClick={() => setView('shop')} 
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-extrabold font-mono rounded-xl cursor-pointer"
            >
              Browse bookstore
            </button>
          </div>
        )}

      </div>
    );
  }

  // CUSTOMER DASHBOARD PRINCIPAL COMPONENT
  return (
    <div className="space-y-8 py-4 animate-fade-in text-left">
      
      {/* Welcome panel header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 p-6 rounded-3xl border border-white/5 glass-card shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
            <Sparkles className="h-3 w-3" />
            <span>ACCIDENT-PROOF VISUAL ACCOUNT SIGNED</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-50 font-sans">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs text-slate-450">Manage account permissions, browse invoice balances, and download PDF catalogs.</p>
        </div>

        <button
          id="dash-logout-btn"
          onClick={logoutUser}
          className="px-4 py-2 text-xs font-bold font-mono text-rose-450 hover:bg-rose-500/5 border border-rose-500/20 rounded-xl cursor-pointer transition-all"
        >
          Logout Session
        </button>
      </div>

      {/* KPI stats highlight card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
        
        <div className="p-5 glass-card border border-white/5 rounded-2xl shadow-xl text-left relative overflow-hidden">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">eBooks Owned</span>
          <span className="text-2xl font-black text-emerald-400 block">
            {ownedBooks.length} Copies
          </span>
          <span className="text-[10px] text-slate-500 font-sans">All direct license updates lifetime enabled.</span>
          <div className="absolute right-4 bottom-4 text-emerald-400 opacity-20"><BookOpen className="h-8 w-8" /></div>
        </div>

        <div className="p-5 glass-card border border-white/5 rounded-2xl shadow-xl text-left relative overflow-hidden">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">Accrued Spent</span>
          <span className="text-2xl font-black text-emerald-400 block">
            ${ownedBooks.reduce((sum, b) => sum + b.price, 0).toFixed(2)} USD
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Invoices cleared on direct bank protocols.</span>
          <div className="absolute right-4 bottom-4 text-emerald-400 opacity-20"><CreditCard className="h-8 w-8" /></div>
        </div>

        <div className="p-5 glass-card border border-white/5 rounded-2xl shadow-xl text-left relative overflow-hidden">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">Active Wishlist</span>
          <span className="text-2xl font-black text-emerald-400 block">
            {wishlist.length} Items queued
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Ready to complete anytime.</span>
          <div className="absolute right-4 bottom-4 text-emerald-400 opacity-20"><Heart className="h-8 w-8" /></div>
        </div>

      </div>

      {/* Main split layout display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Recent purchases bookshelf previews */}
        <div className="lg:col-span-8 glass-card border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1">
              My Library Shelves ({ownedBooks.length})
            </h3>
            <button 
              id="dash-go-library-all"
              onClick={() => setView('my-library')} 
              className="text-xs font-extrabold text-emerald-400 hover:text-emerald-500 cursor-pointer flex items-center gap-0.5 font-mono"
            >
              Expand Bookshelf
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {ownedBooks.length > 0 ? (
            <div className="space-y-4">
              {ownedBooks.slice(0, 3).map(book => (
                <div 
                  key={book.id}
                  className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-7 bg-black/10 rounded overflow-hidden">
                      <BookCover title={book.title} category={book.category} size="sm" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{book.title}</h4>
                      <span className="text-[10px] text-slate-450 block">Published by {book.author} | {book.pages} Pages</span>
                    </div>
                  </div>

                  <a
                    id={`dash-download-link-${book.id}`}
                    href={`/api/download/${book.id}?email=${user.email}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-lg text-xs font-bold cursor-pointer font-mono"
                    title="Download digital copy"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">Your bookshelf shelves are empty.</p>
          )}
        </div>

        {/* Right Side: Quick account checklists and wishlist */}
        <div className="lg:col-span-4 glass-card border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100 pb-2 border-b border-white/5">
            Digital Account Checklist
          </h3>

          <div className="space-y-3.5 text-xs text-slate-305 font-sans">
            <div className="flex items-start gap-2">
              <div className="h-4 w-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px] mt-0.5">1</div>
              <div>
                <h4 className="font-bold text-slate-200">Security Verification Compliant</h4>
                <p className="text-[10px] text-slate-400">Digital downloads are secured under authorization keys matched to {user.email}.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="h-4 w-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px] mt-0.5">2</div>
              <div>
                <h4 className="font-bold text-slate-200">Lifetime Reader Updates</h4>
                <p className="text-[10px] text-slate-400">All revisions released by creator Ayush are accessible 100% free of recharge.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="h-4 w-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-[10px] mt-0.5">3</div>
              <div>
                <h4 className="font-bold text-slate-200">Direct creator transfer standard</h4>
                <p className="text-[10px] text-slate-400">Direct invoice checks processed securely on verified bank references.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
