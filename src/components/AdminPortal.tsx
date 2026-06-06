/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { BookCover } from './Storefront.js';
import { Book, Order, Customer, BankDetails, PaymentGateways, AnalyticsSummary } from '../types.js';
import { 
  ShieldAlert, 
  Lock, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Users, 
  ShoppingBag, 
  Download, 
  CheckCircle, 
  Bell,
  CreditCard,
  Building,
  Key,
  X,
  FileSpreadsheet,
  CloudLightning
} from 'lucide-react';

export default function AdminPortal() {
  const { 
    activeView, 
    setView, 
    user, 
    loginUser, 
    logoutUser, 
    books, 
    refreshBooks, 
    showToast 
  } = useApp();

  // Login forms states
  const [emailInput, setEmailInput] = useState('ayush@library.com');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Analytics states
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Alert Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  // Subsections inside Admin View
  const [adminTab, setAdminTab] = useState<'overview' | 'products' | 'pricing' | 'gateways' | 'bank' | 'orders' | 'customers'>('overview');

  // Book edit state
  const [isEditingBook, setIsEditingBook] = useState<boolean>(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    category: 'Programming',
    price: '19.99',
    description: '',
    pages: '150',
    fileSize: '4.5 MB',
  });

  // Settings Forms States
  const [bankSettings, setBankSettings] = useState<BankDetails>({
    bankName: '',
    holderName: '',
    accountNumber: '',
    routingNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentGateways>({
    stripeEnabled: true,
    stripeKey: '',
    razorpayEnabled: true,
    razorpayKey: '',
    paypalEnabled: true,
    paypalEmail: '',
    upiEnabled: true,
    upiId: '',
    netBankingEnabled: true
  });

  // Orders and Customers Lists
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Sync session lists and details
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAnalytics();
      fetchSettings();
      fetchLists();
      fetchNotifications();
      
      // Select appropriate tab depending on activeView routing triggers
      if (activeView === 'product-management') setAdminTab('products');
      else if (activeView === 'price-management') setAdminTab('pricing');
      else if (activeView === 'payment-settings') setAdminTab('gateways');
      else if (activeView === 'bank-details') setAdminTab('bank');
      else if (activeView === 'customer-management') setAdminTab('customers');
      else if (activeView === 'orders-management') setAdminTab('orders');
      else if (activeView === 'analytics-dashboard') setAdminTab('overview');
    }
  }, [user, activeView]);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchSettings = async () => {
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;
    try {
      // Bank settings
      const br = await fetch('/api/admin/settings/bank');
      if (br.ok) {
        const bData = await br.json();
        setBankSettings(bData);
      }
      // Payment settings
      const pr = await fetch('/api/admin/settings/payments');
      if (pr.ok) {
        const pData = await pr.json();
        setPaymentSettings(pData);
      }
    } catch (e) {}
  };

  const fetchLists = async () => {
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;
    setLoadingLists(true);
    try {
      const or = await fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } });
      if (or.ok) {
        const oData = await or.json();
        setOrdersList(oData);
      }
      const cr = await fetch('/api/admin/customers', { headers: { 'Authorization': `Bearer ${token}` } });
      if (cr.ok) {
        const cData = await cr.json();
        setCustomersList(cData);
      }
    } catch (e) {}
    finally {
      setLoadingLists(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {}
  };

  // Submit Admin authentication logging
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError("All credentials must be supplied");
      return;
    }

    setSubmittingAuth(true);
    try {
      const res = await loginUser(emailInput, passwordInput, true);
      if (!res.success) {
        setAuthError(res.error || "Invalid owner/developer passphrase credentials.");
      } else {
        showToast("Authenticated as Owner successful!", "success");
      }
    } catch (err) {
      setAuthError("Server API authentication failed");
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Save Book Handler (Create / Update)
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;

    if (!bookForm.title || !bookForm.price) {
      showToast("Title and price specifications required.", "warning");
      return;
    }

    try {
      const method = editingBookId ? 'PUT' : 'POST';
      const url = editingBookId ? `/api/books/${editingBookId}` : '/api/books';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: bookForm.title,
          category: bookForm.category,
          price: Number(bookForm.price),
          description: bookForm.description,
          pages: Number(bookForm.pages),
          fileSize: bookForm.fileSize,
        })
      });

      if (res.ok) {
        showToast(editingBookId ? "eBook data modified successfully!" : "New eBook published live in stock!", "success");
        setIsEditingBook(false);
        setEditingBookId(null);
        setBookForm({ title: '', category: 'Programming', price: '19.99', description: '', pages: '150', fileSize: '4.5 MB' });
        await refreshBooks();
        await fetchAnalytics();
      } else {
        showToast("Error committing book metadata to database.", "error");
      }
    } catch (err) {
      showToast("Server timeout saving book variables", "error");
    }
  };

  // Quick edit loader
  const triggerEditBook = (b: Book) => {
    setEditingBookId(b.id);
    setBookForm({
      title: b.title,
      category: b.category,
      price: String(b.price),
      description: b.description || '',
      pages: String(b.pages || 100),
      fileSize: b.fileSize || '5.0 MB'
    });
    setIsEditingBook(true);
  };

  // Delete Book
  const handleDeleteBook = async (id: string, titleStr: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${titleStr}"? This action cannot be undone.`)) return;
    
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`"${titleStr}" has been permanently purged from catalog shelves`, "success");
        await refreshBooks();
        await fetchAnalytics();
      }
    } catch (e) {
      showToast("Server rejection during delete operation", "error");
    }
  };

  // Save Settings Handlers
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/settings/bank', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(bankSettings)
      });
      if (res.ok) {
        showToast("Author bank details updated securely! Payment credits routed.", "success");
      }
    } catch (e) {}
  };

  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/settings/payments', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(paymentSettings)
      });
      if (res.ok) {
        showToast("Payment gateway credentials successfully synchronized!", "success");
      }
    } catch (e) {}
  };

  // Quick price modifier
  const inlinePriceUpdate = async (bookId: string, newPrice: number) => {
    const token = localStorage.getItem('ayush-lib-token');
    if (!token) return;

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ price: Number(newPrice) })
      });
      if (res.ok) {
        showToast("eBook price modified successfully!", "info");
        await refreshBooks();
        await fetchAnalytics();
      }
    } catch (e) {}
  };

  // ADMIN LOGIN CARD VIEW (Ayush privileges)
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12 animate-fade-in text-left">
        <div className="glass-card border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6 text-slate-100">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl font-bold border border-amber-500/20">
              <ShieldAlert className="h-6 w-6 text-amber-400" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-50 font-sans">Owner Administration Gateway</h2>
            <p className="text-xs text-slate-400">Strict authentication checks. Restricted to Author Ayush only.</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 text-rose-300 text-xs rounded-xl border border-rose-550/20 font-mono">
              ⚠ {authError}
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
            <div>
              <label id="lbl-adm-email" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Owner Access Email</label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="ayush@library.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label id="lbl-adm-pass" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">Developer Private Passphrase</label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="密码 (e.g. admin123)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-450 block mt-1.5 leading-snug">Demo Credentials preset: <strong className="text-emerald-400">admin123</strong> / <strong className="text-emerald-400">ayush@library.com</strong></span>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={submittingAuth}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs tracking-wider uppercase rounded-xl cursor-pointer transition-all font-mono"
            >
              {submittingAuth ? "Authorizing key..." : "Sign in to console"}
            </button>
          </form>

          <button 
            id="admin-back-store"
            onClick={() => setView('home')} 
            className="w-full text-center text-xs text-slate-450 hover:text-slate-200 pt-2 block cursor-pointer hover:underline"
          >
            &larr; Return to Bookstore Front
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE ADMIN CONSOLE LAYOUT
  return (
    <div className="space-y-8 py-4 animate-fade-in text-left">
      
      {/* Console Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-3xl border border-white/5 glass-card relative overflow-hidden shadow-2xl">
        {/* Glow ambient background element */}
        <div className="absolute right-0 top-0 h-32 w-32 bg-emerald-500/10 blur-xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-mono">
            <ShieldAlert className="h-4 w-4 text-emerald-405" />
            <span>AUTHOR / ADMIN MASTER CONSOLE</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-50 font-sans">
            Ayush Digital Library Control Room
          </h1>
          <p className="text-xs text-slate-400 leading-normal">
            Manage books listing, dynamically adjust prices, view transactional order logs, and configure secure API payment keys.
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          <button
            id="adm-return-sho"
            onClick={() => setView('shop')}
            className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs text-slate-300 font-bold rounded-xl cursor-pointer transition-all font-mono"
          >
            eBooks Shop
          </button>
          <button
            id="adm-logout"
            onClick={logoutUser}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-705 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            Logout admin
          </button>
        </div>
      </div>

      {/* Grid of panels section with left Tab layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav anchors */}
        <div className="lg:col-span-3 flex flex-col gap-1 w-full p-2 glass-card border border-white/5 rounded-2xl font-sans text-left">
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 p-2 block font-bold">MANAGEMENT CHANNELS</span>
          {[
            { id: 'overview', label: 'Analytics Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
            { id: 'products', label: 'eBook Product Catalog', icon: <ShoppingBag className="h-4 w-4" /> },
            { id: 'pricing', label: 'Price Matrix Manager', icon: <DollarSign className="h-4 w-4" /> },
            { id: 'gateways', label: 'Payment API Settings', icon: <Key className="h-4 w-4" /> },
            { id: 'bank', label: 'Configure Bank Account', icon: <Building className="h-4 w-4" /> },
            { id: 'orders', label: 'Transaction Orders Logs', icon: <FileSpreadsheet className="h-4 w-4" /> },
            { id: 'customers', label: 'Registered Readers List', icon: <Users className="h-4 w-4" /> }
          ].map(tab => (
            <button
               id={`tab-btn-${tab.id}`}
               key={tab.id}
               onClick={() => setAdminTab(tab.id as any)}
               className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                 adminTab === tab.id 
                   ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-md shadow-emerald-500/15 font-mono' 
                   : 'text-slate-300 hover:bg-white/5'
               }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contents area panel right */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: ANALYTICS OVERVIEW DASHBOARD */}
          {adminTab === 'overview' && (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* Analytics Summary Badges */}
              {loadingAnalytics || !analytics ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>
              ) : (
                <div className="space-y-8">
                  
                  {/* KPI Panels Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 glass-card border border-white/5 rounded-xl relative overflow-hidden shadow-lg">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block mb-0.5">Total Revenue Generated</span>
                      <span className="text-xl font-bold font-mono text-emerald-400 block">${analytics.totalRevenue}</span>
                      <span className="text-[10px] text-slate-500 font-sans">Net direct-transfer credits</span>
                      <div className="absolute right-3 bottom-3 text-emerald-400 opacity-10"><DollarSign className="h-6 w-6" /></div>
                    </div>
                    
                    <div className="p-4 glass-card border border-white/5 rounded-xl relative overflow-hidden shadow-lg">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block mb-0.5">Total Sales Volume</span>
                      <span className="text-xl font-bold font-mono text-slate-100 block">{analytics.totalSalesCount} Orders</span>
                      <span className="text-[10px] text-slate-500 font-sans">Checkout operations logged</span>
                      <div className="absolute right-3 bottom-3 text-slate-400 opacity-10"><ShoppingBag className="h-6 w-6" /></div>
                    </div>

                    <div className="p-4 glass-card border border-white/5 rounded-xl relative overflow-hidden shadow-lg">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block mb-0.5">Conversion Rate</span>
                      <span className="text-xl font-bold font-mono text-slate-100 block">{analytics.conversionRate}%</span>
                      <span className="text-[10px] text-slate-555 font-sans">Views vs Checkout orders</span>
                      <div className="absolute right-3 bottom-3 text-slate-400 opacity-10"><TrendingUp className="h-6 w-6" /></div>
                    </div>

                    <div className="p-4 glass-card border border-white/5 rounded-xl relative overflow-hidden shadow-lg">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block mb-0.5">Product View Traces</span>
                      <span className="text-xl font-bold font-mono text-slate-100 block">{analytics.totalViews} clicks</span>
                      <span className="text-[10px] text-slate-500 font-sans">Dynamic traces recorded</span>
                      <div className="absolute right-3 bottom-3 text-slate-400 opacity-10"><Eye className="h-6 w-6" /></div>
                    </div>
                  </div>

                  {/* HIGH-FIDELITY INTERACTIVE SVG CHARTS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* SVG Line Chart: Revenue Trend over Months */}
                    <div className="glass-card border border-white/5 p-5 rounded-2xl relative shadow-lg">
                      <h3 className="font-bold text-xs tracking-wide uppercase text-slate-300 pb-2 border-b border-white/5 mb-4 font-mono">
                        Monthly Revenue Sales Trend ($)
                      </h3>
                      
                      <div className="w-full h-52 flex items-end justify-center pt-4 relative select-none">
                        {/* Background guide lines */}
                        <div className="absolute inset-x-0 top-10 border-t border-white/5 pointer-events-none" />
                        <div className="absolute inset-x-0 top-24 border-t border-white/5 pointer-events-none" />
                        <div className="absolute inset-x-0 top-38 border-t border-white/5 pointer-events-none" />
                        
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                          {/* Render beautiful custom SVG line charts */}
                          <defs>
                            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Dynamic Calculations based on values */}
                          {(() => {
                            const maxVal = Math.max(...analytics.monthlySales.map(s => s.revenue), 100);
                            const widthStep = 320 / (analytics.monthlySales.length - 1 || 1);
                            
                            // Map values to line coordinates (X, Y)
                            const coords = analytics.monthlySales.map((s, i) => {
                              const x = 40 + i * widthStep;
                              const y = 170 - (s.revenue / maxVal) * 130;
                              return { x, y, val: s.revenue, month: s.month };
                            });

                            const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                            const fillPath = `${linePath} L ${coords[coords.length-1].x} 170 L ${coords[0].x} 170 Z`;

                            return (
                              <>
                                {/* Bottom axes */}
                                <line x1="30" y1="170" x2="380" y2="170" stroke="#334155" strokeWidth="1" strokeOpacity="0.8" />
                                
                                {/* Area fill */}
                                <path d={fillPath} fill="url(#chart-area-grad)" />

                                {/* Line path */}
                                <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Points and values */}
                                {coords.map((c, i) => (
                                  <g key={i}>
                                    <circle cx={c.x} cy={c.y} r="4" fill="#10b981" stroke="#020617" strokeWidth="2" />
                                    {/* Month labels */}
                                    <text x={c.x} y="185" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">
                                      {c.month}
                                    </text>
                                    {/* Values label */}
                                    <text x={c.x} y={c.y - 8} fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                      ${Math.round(c.val)}
                                    </text>
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    </div>

                    {/* SVG Column Chart: Daily Views logs */}
                    <div className="glass-card border border-white/5 p-5 rounded-2xl relative shadow-lg">
                      <h3 className="font-bold text-xs tracking-wide uppercase text-slate-300 pb-2 border-b border-white/5 mb-4 font-mono">
                        Daily Views (Click Telemetry)
                      </h3>
                      
                      <div className="w-full h-52 flex items-end justify-center pt-4 relative select-none">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                          {(() => {
                            const maxViews = Math.max(...analytics.dailyViews.map(v => v.views), 10);
                            const widthStep = 340 / (analytics.dailyViews.length || 1);
                            
                            return (
                              <>
                                <line x1="20" y1="170" x2="380" y2="170" stroke="#334155" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="3" />
                                
                                {analytics.dailyViews.map((item, i) => {
                                  const colWidth = 14;
                                  const x = 30 + i * widthStep;
                                  const colHeight = (item.views / maxViews) * 130;
                                  const y = 170 - colHeight;
                                  
                                  return (
                                    <g key={i}>
                                      {/* Bar */}
                                      <rect 
                                        x={x} 
                                        y={y} 
                                        width={colWidth} 
                                        height={colHeight} 
                                        fill="rgba(16, 185, 129, 0.1)" 
                                        stroke="rgba(16, 185, 129, 0.2)"
                                        rx="3" 
                                      />
                                      <rect 
                                        x={x} 
                                        y={y} 
                                        width={colWidth} 
                                        height={colHeight > 20 ? 10 : colHeight} 
                                        fill="#10b981" 
                                        rx="3" 
                                      />
                                      
                                      {/* View score label */}
                                      <text x={x + colWidth/2} y={y - 6} fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                                        {item.views}
                                      </text>
                                      
                                      {/* Axis Label */}
                                      <text x={x + colWidth/2} y="185" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="sans-serif">
                                        {item.date}
                                      </text>
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                    </div>

                    {/* Left: Category distribution progress bars list */}
                    <div className="glass-card border border-white/5 p-5 rounded-2xl text-left shadow-lg">
                      <h4 className="font-bold text-xs tracking-wider uppercase text-slate-400 pb-2 border-b border-white/5 mb-4 font-mono">
                        eBook distribution by Category
                      </h4>
                      <div className="space-y-3.5">
                        {analytics.categoryDistribution.map((cat, i) => (
                          <div key={i} className="space-y-1 text-xs">
                            <div className="flex justify-between items-center text-slate-350">
                              <span className="font-bold">{cat.category}</span>
                              <span className="font-mono font-bold text-emerald-450">{cat.count} files published</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                                style={{ width: `${(cat.count / Math.max(books.length, 1)) * 100}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: eBook downloads counter leaderboard */}
                    <div className="glass-card border border-white/5 p-5 rounded-2xl text-left shadow-lg">
                      <h4 className="font-bold text-xs tracking-wider uppercase text-slate-400 pb-2 border-b border-white/5 mb-4 font-mono">
                        eBook downloads telemetry (Best sellers)
                      </h4>
                      <div className="space-y-3.5 font-sans">
                        {analytics.downloadStats.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-slate-900/40 border border-white/5 rounded-xl">
                            <h4 className="font-bold text-slate-300 truncate pr-4 max-w-64">{item.bookTitle}</h4>
                            <div className="flex items-center gap-1 font-mono font-bold text-emerald-400 flex-shrink-0">
                              <Download className="h-3.5 w-3.5" />
                              <span>{item.count} downloads</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Operational Notifications Board Panel */}
                  <div className="glass-card border border-white/5 p-5 rounded-2xl text-left leading-normal shadow-lg">
                    <h3 className="font-bold text-xs font-mono tracking-widest text-emerald-400 pb-2 border-b border-white/5 mb-3 flex items-center gap-1.5 uppercase">
                      <Bell className="h-4 w-4 text-emerald-500" />
                      Live Store Telemetry Alerts Board
                    </h3>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {notifications.map((notif, index) => (
                        <div key={index} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-start gap-2 text-xs leading-normal">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-slate-201">{notif.message}</h4>
                            <p className="text-[10px] text-slate-450 leading-tight">{notif.subtext}</p>
                          </div>
                          <span className="text-[8px] font-mono text-slate-450 italic flex-shrink-0">{new Date(notif.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT PAGE */}
          {adminTab === 'products' && (
            <div className="space-y-6 animate-fade-in text-left font-sans">
              
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm">Active eBook Stock Catalog ({books.length})</h3>
                  <p className="text-xs text-slate-400 pr-4">Create or adjust files metadata, pages summaries, and cover designs.</p>
                </div>
                
                {!isEditingBook && (
                  <button
                    id="add-new-book-btn"
                    onClick={() => {
                      setEditingBookId(null);
                      setBookForm({ title: '', category: 'Programming', price: '19.99', description: '', pages: '150', fileSize: '4.5 MB' });
                      setIsEditingBook(true);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1 font-mono shadow-md shadow-emerald-500/10"
                  >
                    <Plus className="h-4 w-4" />
                    Add eBook
                  </button>
                )}
              </div>

              {/* Editing Form */}
              {isEditingBook && (
                <div className="p-6 glass-card border border-white/10 rounded-2xl relative animate-fade-in space-y-4 shadow-2xl">
                  <h4 className="font-bold text-sm text-slate-310 flex items-center gap-1 border-b border-white/5 pb-2">
                    <Edit className="h-4 w-4 text-emerald-400" />
                    {editingBookId ? 'Modify eBook Parameters' : 'Create New eBook Entry'}
                  </h4>
                  
                  <button 
                    id="close-book-form-btn"
                    onClick={() => setIsEditingBook(false)} 
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <form onSubmit={handleSaveBook} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label id="lbl-bk-title" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Book Title</label>
                      <input
                        id="book-title-input"
                        type="text"
                        required
                        placeholder="e.g. Learning Functional Scala"
                        value={bookForm.title}
                        onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                        className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    
                    <div className="sm:col-span-4">
                      <label id="lbl-bk-price" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Price ($ USD)</label>
                      <input
                        id="book-price-input"
                        type="number"
                        step="0.01"
                        required
                        placeholder="19.99"
                        value={bookForm.price}
                        onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                        className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label id="lbl-bk-category" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Category</label>
                      <select
                        id="book-category-select"
                        value={bookForm.category}
                        onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                        className="w-full text-xs font-sans px-3 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                      >
                        <option value="Programming">Programming / Code</option>
                        <option value="Security">Security / Penetration</option>
                        <option value="Frameworks">JS Frameworks</option>
                        <option value="Self-Improvement">Self Improvement / Career</option>
                        <option value="Business">Indie Business / Growth</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label id="lbl-bk-pages" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Page length</label>
                      <input
                        id="book-pages-input"
                        type="number"
                        placeholder="180"
                        value={bookForm.pages}
                        onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                        className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label id="lbl-bk-filesize" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">File volume size</label>
                      <input
                        id="book-filesize-input"
                        type="text"
                        placeholder="4.5 MB"
                        value={bookForm.fileSize}
                        onChange={(e) => setBookForm({ ...bookForm, fileSize: e.target.value })}
                        className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label id="lbl-bk-desc" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Synoptic Description Summary</label>
                      <textarea
                        id="book-description-textarea"
                        rows={4}
                        placeholder="Summarize textbook parameters, who is and who is not this book designed for..."
                        value={bookForm.description}
                        onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                        className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500 bg-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-12 flex justify-end gap-2 pt-2">
                      <button
                        id="submit-book-btn-form"
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-650 text-zinc-950 font-extrabold text-xs rounded-xl cursor-pointer font-mono"
                      >
                        {editingBookId ? 'Save Changes' : 'Publish eBook'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Grid database list */}
              <div className="space-y-3">
                {books.map(b => (
                  <div 
                    key={b.id}
                    className="p-4 glass-card border border-white/5 rounded-xl flex items-center justify-between gap-4 font-sans text-left shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-7 bg-black/10 rounded overflow-hidden">
                        <BookCover title={b.title} category={b.category} size="sm" />
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{b.title}</h4>
                        <p className="text-[10px] text-slate-450 font-mono">Category: <span className="text-emerald-400">{b.category}</span> | Price: <span className="text-emerald-400">${b.price}</span> | Sold: {b.salesCount || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        id={`btn-edit-catalog-${b.id}`}
                        onClick={() => triggerEditBook(b)}
                        className="p-2 text-emerald-400 hover:bg-emerald-500/15 rounded-lg cursor-pointer transition-colors"
                        title="Edit eBook Specs"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        id={`btn-delete-catalog-${b.id}`}
                        onClick={() => handleDeleteBook(b.id, b.title)}
                        className="p-2 text-rose-450 hover:bg-rose-500/15 rounded-lg cursor-pointer transition-colors"
                        title="Delete eBook"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: PRICE MATRIX MANAGEMENT */}
          {adminTab === 'pricing' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-50">Author Inline Pricing Matrix</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Quick-adjust active customer-facing values for any digital manuals directly. Changes sync immediately.
                </p>
              </div>

              <div className="border border-white/5 glass-card rounded-2xl overflow-hidden font-sans shadow-2xl">
                <table id="price-matrix-table" className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Digital Guide Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Active sales</th>
                      <th className="p-4">Modify Price ($ USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {books.map(b => (
                      <tr key={b.id} className="hover:bg-white/5 text-slate-300">
                        <td className="p-4 font-bold">{b.title}</td>
                        <td className="p-4 font-mono text-[10px] text-slate-450">{b.category}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">{b.salesCount || 0} purchases</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">$</span>
                            <input
                              id={`price-matrix-input-${b.id}`}
                              type="number"
                              step="0.01"
                              value={b.price}
                              onChange={(e) => inlinePriceUpdate(b.id, Number(e.target.value))}
                              className="w-16 p-1 rounded-lg text-slate-100 glass-input text-center font-bold font-mono focus:outline-none"
                            />
                            <span className="text-[9px] text-slate-450 font-mono">USD</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT GATEWAYS CONFIGURATION */}
          {adminTab === 'gateways' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-100">Secure Payments Setup</h3>
                <p className="text-xs text-slate-400">Configure client side visibility parameters and credential switches.</p>
              </div>

              <form onSubmit={handleSavePayments} className="glass-card border border-white/5 p-6 rounded-2xl space-y-6 font-sans shadow-2xl">
                
                {/* Stripe block */}
                <div className="space-y-3.5 pb-4 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-150 flex items-center gap-1.5 dark:text-zinc-155">
                      <CreditCard className="h-4 w-4 text-emerald-450" />
                      Stripe Gateway Merchant
                    </h4>
                    <label id="lbl-stripe-status" className="inline-flex items-center cursor-pointer">
                      <input 
                        id="stripe-enabled-ck"
                        type="checkbox" 
                        checked={paymentSettings.stripeEnabled}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeEnabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="relative w-9 h-5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-100 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ms-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Active</span>
                    </label>
                  </div>
                  
                  <input
                    id="stripe-api-key"
                    type="text"
                    placeholder="Stripe publishable live/test keys (pk_test_...)"
                    value={paymentSettings.stripeKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeKey: e.target.value })}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Razorpay block */}
                <div className="space-y-3.5 pb-4 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-150 flex items-center gap-1.5">
                      <CloudLightning className="h-4 w-4 text-emerald-450" />
                      Razorpay UPI/Netbanking portal
                    </h4>
                    <label id="lbl-razorpay-status" className="inline-flex items-center cursor-pointer">
                      <input 
                        id="razorpay-enabled-ck"
                        type="checkbox" 
                        checked={paymentSettings.razorpayEnabled}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayEnabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="relative w-9 h-5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-100 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ms-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Active</span>
                    </label>
                  </div>
                  
                  <input
                    id="razorpay-api-key"
                    type="text"
                    placeholder="Razorpay Credentials reference code (rzp_key_test_...)"
                    value={paymentSettings.razorpayKey}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKey: e.target.value })}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* UPI block */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-150 flex items-center gap-1.5">
                      <span>📲</span> Direct GooglePay & UPI Address
                    </h4>
                    <label id="lbl-upi-status" className="inline-flex items-center cursor-pointer">
                      <input 
                        id="upi-enabled-ck"
                        type="checkbox" 
                        checked={paymentSettings.upiEnabled}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, upiEnabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="relative w-9 h-5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-100 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ms-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Active</span>
                    </label>
                  </div>
                  
                  <input
                    id="upi-api-key"
                    type="text"
                    placeholder="Owner personal VPA handle (e.g., ayush@upi)"
                    value={paymentSettings.upiId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, upiId: e.target.value })}
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  id="save-payment-settings-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs rounded-xl cursor-pointer font-mono"
                >
                  Synchronize API Keys
                </button>

              </form>
            </div>
          )}

          {/* TAB 5: BANK ACCOUNT SETTINGS */}
          {adminTab === 'bank' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-50">Withdrawal Bank Account Details</h3>
                <p className="text-xs text-slate-400 pr-2">Fill in your physical bank routing references to credit successful customer eBook purchases.</p>
              </div>

              <form onSubmit={handleSaveBank} className="glass-card border border-white/5 p-6 rounded-2xl space-y-4 font-sans max-w-xl shadow-2xl">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label id="lbl-bank-name" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Financial Institution Bank Name</label>
                    <input
                      id="bank-name-input"
                      type="text"
                      required
                      placeholder="e.g. State Bank of India"
                      value={bankSettings.bankName}
                      onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label id="lbl-holder-name" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Account Holder Full Name</label>
                    <input
                      id="bank-holder-input"
                      type="text"
                      required
                      placeholder="Ayush"
                      value={bankSettings.holderName}
                      onChange={(e) => setBankSettings({ ...bankSettings, holderName: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label id="lbl-bank-account" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Savings/Current Account Number</label>
                    <input
                      id="bank-account-input"
                      type="text"
                      required
                      placeholder="39284200421"
                      value={bankSettings.accountNumber}
                      onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label id="lbl-bank-ifsc" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">IFSC / Electronic Transfer Code</label>
                    <input
                      id="bank-ifsc-input"
                      type="text"
                      required
                      placeholder="SBIN0003049"
                      value={bankSettings.ifscCode}
                      onChange={(e) => setBankSettings({ ...bankSettings, ifscCode: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500 font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label id="lbl-bank-vpa" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">UPI Payee ID</label>
                  <input
                    id="bank-vpa-input"
                    type="text"
                    required
                    placeholder="ayush@sbi"
                    value={bankSettings.upiId}
                    onChange={(e) => setBankSettings({ ...bankSettings, upiId: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="save-bank-settings-btn"
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs rounded-xl cursor-pointer font-mono shadow-md shadow-emerald-500/10"
                  >
                    Save Financial References
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 6: ORDER LOG HISTORY */}
          {adminTab === 'orders' && (
            <div className="space-y-6 animate-fade-in text-left font-sans">
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">Author Order Transaction Log</h3>
                <p className="text-xs text-slate-400 pr-4">Log profiles of all processed customer checkout transactions since catalog active deployment.</p>
              </div>

              {loadingLists ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>
              ) : ordersList.length > 0 ? (
                <div className="divide-y divide-white/5 border border-white/5 rounded-2xl glass-card overflow-hidden text-xs shadow-2xl">
                  {ordersList.map(ord => (
                    <div key={ord.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans hover:bg-white/5">
                      
                      <div className="space-y-1 block max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono tracking-wide text-slate-100">{ord.receiptNumber}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-mono font-bold px-1.5 py-0.5 rounded uppercase">Paid</span>
                        </div>
                        
                        <p className="text-slate-300 text-xs">Customer: <strong className="text-slate-100">{ord.customerName}</strong> ({ord.customerEmail})</p>
                        <p className="text-[10px] text-slate-450 italic">eBooks: {ord.books.map(b => `"${b.title}"`).join(', ')}</p>
                      </div>

                      <div className="flex items-center justify-between md:text-right gap-6 font-mono text-xs">
                        <div className="hidden md:block">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Method</span>
                          <span className="text-slate-300 block">{ord.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-mono block">Paid total</span>
                          <span className="text-sm font-black text-emerald-400">${ord.totalPrice}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Trace Timestamp</span>
                          <span className="text-[10px] text-slate-405 italic">{new Date(ord.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-12 text-center">No transactions orders logged into server backend.</p>
              )}
            </div>
          )}

          {/* TAB 7: READERS LIST BROWSER */}
          {adminTab === 'customers' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h3 className="font-bold text-sm text-slate-100 font-sans">Registered Readers Catalog</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Active accounts catalog logged across the checkouts. Easily track reader total spend volumes.
                </p>
              </div>

              {loadingLists ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>
              ) : customersList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans animate-fade-in">
                  {customersList.map(cust => (
                    <div 
                      key={cust.id}
                      className="p-4 glass-card border border-white/5 rounded-xl shadow-lg"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-emerald-550/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {cust.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100 leading-tight">{cust.name}</h4>
                            <span className="text-[10px] text-slate-450 block">{cust.email}</span>
                          </div>
                        </div>
                        
                        <span className="text-[9px] font-mono uppercase text-slate-500">{cust.id.split('-')[0]}</span>
                      </div>

                      <div className="h-px bg-white/5 my-3" />

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                        <div>
                          <span className="block uppercase text-slate-500 text-[8px]">Owned shelf copy</span>
                          <span className="font-bold text-slate-200">{cust.purchasedBookIds.length} eBooks</span>
                        </div>
                        <div className="text-right">
                          <span className="block uppercase text-slate-500 text-[8px]">Total value spend</span>
                          <span className="font-bold text-emerald-404 text-emerald-400 block">${cust.totalSpent} USD</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-12 text-center">No readers registered on the platform catalog database.</p>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
