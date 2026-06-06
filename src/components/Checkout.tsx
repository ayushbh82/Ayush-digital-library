/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { BookCover } from './Storefront.js';
import { 
  Trash2, 
  ShoppingBag, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle, 
  ChevronRight, 
  Receipt,
  Gift,
  Download,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function Checkout() {
  const { 
    cart, 
    cartTotal, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    setView, 
    user,
    showToast,
    refreshBooks
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'pay' | 'success'>('cart');
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState(user ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(user ? user.email : '');
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Razorpay' | 'PayPal' | 'UPI' | 'Card' | 'NetBanking'>('Card');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0); // dollar amount
  const [submittingPayment, setSubmittingPayment] = useState(false);
  
  // Successful order outcome
  const [finalOrder, setFinalOrder] = useState<any | null>(null);

  // Auto-populate user details if logged in or changed
  React.useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
    }
  }, [user]);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'AYUSHSTUDIO') {
      const discount = Number((cartTotal * 0.2).toFixed(2));
      setDiscountApplied(discount);
      showToast("Voucher code 'AYUSHSTUDIO' applied! 20% discount subtracted.", "success");
    } else {
      showToast("Invalid checkout coupon code.", "warning");
    }
  };

  const netTotal = Number((cartTotal - discountApplied).toFixed(2));

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      showToast("Please provide customer name and billing email address.", "warning");
      return;
    }

    if (cart.length === 0) {
      showToast("Cannot check out an empty shopping cart.", "warning");
      return;
    }

    setSubmittingPayment(true);
    try {
      const payload = {
        customerName,
        customerEmail,
        paymentMethod,
        cartItems: cart.map(item => ({
          bookId: item.book.id,
          title: item.book.title,
          price: item.book.price,
          quantity: item.quantity
        }))
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setFinalOrder(data.order);
        setCheckoutStep('success');
        clearCart();
        showToast("eBook purchase completed successfully!", "success");
        await refreshBooks(); // update purchase counts
        
        // Sync the purchased books to the logged in user as well if matching emails
        if (user && user.email.toLowerCase() === customerEmail.toLowerCase()) {
          const authUser = JSON.parse(localStorage.getItem('ayush-lib-user') || '{}');
          if (authUser.purchasedBookIds) {
            authUser.purchasedBookIds = Array.from(new Set([...authUser.purchasedBookIds, ...data.order.bookIds]));
            localStorage.setItem('ayush-lib-user', JSON.stringify(authUser));
          }
        }
      } else {
        showToast(data.error || "Simulation gateway failed to approve purchase.", "error");
      }
    } catch (e) {
      showToast("Server payment endpoint connection timeout", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // CART VIEW HANDLER
  if (checkoutStep === 'cart') {
    return (
      <div className="space-y-8 py-4 animate-fade-in text-left">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-emerald-400 h-6 w-6" />
            Your Library Shopping Cart
          </h1>
          <p className="text-xs text-slate-400">Review selected digital assets before compiling download key authorization.</p>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* List Cart items */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map(item => (
                <div 
                  key={item.book.id}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl glass-card border border-white/5 shadow-lg"
                >
                  <div className="flex-shrink-0">
                    <BookCover title={item.book.title} category={item.book.category} size="sm" />
                  </div>

                  <div className="flex-grow text-center sm:text-left space-y-1">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {item.book.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 leading-snug">
                      {item.book.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">File Size: {item.book.fileSize} | Format: secure PDF</p>
                  </div>

                  {/* Quantity and controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-slate-900/40">
                      <button 
                        id={`dec-qty-${item.book.id}`}
                        onClick={() => updateCartQuantity(item.book.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs hover:bg-white/10 text-slate-300 font-mono"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold font-mono text-slate-100">
                        {item.quantity}
                      </span>
                      <button 
                        id={`inc-qty-${item.book.id}`}
                        onClick={() => updateCartQuantity(item.book.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs hover:bg-white/10 text-slate-300 font-mono"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right sm:min-w-20 pl-2">
                      <span className="block text-xs font-extrabold text-slate-100 font-mono">
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">${item.book.price} each</span>
                    </div>

                    <button
                      id={`remove-cart-${item.book.id}`}
                      onClick={() => removeFromCart(item.book.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Summary block panel */}
            <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-white/5 space-y-6 shadow-2xl">
              <h3 className="font-bold text-sm text-slate-50 pb-2 border-b border-white/5">
                Purchase Invoice Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Cart Item Count</span>
                  <span className="font-mono font-bold text-slate-100">{cart.length} unique eBooks</span>
                </div>
                <div className="flex justify-between text-slate-300 mt-1">
                  <span>Product Subtotal</span>
                  <span className="font-mono font-bold text-slate-100">${cartTotal}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount (20% Code)</span>
                    <span className="font-mono">-${discountApplied}</span>
                  </div>
                )}
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between text-sm text-slate-50 font-extrabold">
                  <span>Calculated Net Total</span>
                  <span className="font-mono text-emerald-400">${netTotal}</span>
                </div>
              </div>

              {/* Promo code block */}
              <div className="space-y-1.5 pt-2">
                <label id="lbl-promo" className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase">Promo Discount Code</label>
                <div className="flex gap-2">
                  <input
                    id="promo-code-input"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. AYUSHSTUDIO"
                    className="flex-grow px-3 py-1.5 rounded-xl text-xs text-white glass-input focus:ring-1 focus:ring-emerald-500 uppercase font-mono"
                  />
                  <button
                    id="apply-promo-btn"
                    onClick={applyPromo}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-extrabold rounded-xl cursor-pointer transition-all font-mono"
                  >
                    Apply
                  </button>
                </div>
                <span className="text-[10px] block text-slate-400 italic">Try <strong className="text-emerald-400">AYUSHSTUDIO</strong> for 20% off demo purchases!</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <button
                  id="checkout-proceed-btn"
                  onClick={() => setCheckoutStep('pay')}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono shadow-lg shadow-emerald-500/10 animate-pulse"
                >
                  Proceed to Secure Gateway Checkout
                  <ArrowRight className="h-4 w-4 text-zinc-950" />
                </button>
                <button
                  id="checkout-continue-shopping"
                  onClick={() => setView('shop')}
                  className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Continue Browsing Digital Library
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div id="empty-cart-fallback" className="flex flex-col items-center justify-center py-20 glass-card rounded-2xl border border-dashed border-white/10 space-y-4">
            <ShoppingBag className="h-12 w-12 text-slate-550" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-100">Your Cart is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm">You haven't queued up any digital books for purchase yet.</p>
            </div>
            <button 
              id="back-to-shop-from-cart"
              onClick={() => setView('shop')} 
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-extrabold rounded-xl font-mono cursor-pointer transition-all"
            >
              Browse technical manuals
            </button>
          </div>
        )}

      </div>
    );
  }

  // PAY VIEW HANDLER
  if (checkoutStep === 'pay') {
    return (
      <div className="space-y-8 py-4 animate-fade-in text-left">
        <div>
          <button
            id="back-to-cart-btn"
            onClick={() => setCheckoutStep('cart')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-bold font-mono cursor-pointer"
          >
            &larr; Back to Shopping Cart List
          </button>
          <h1 className="text-2xl font-bold font-sans text-slate-50 mt-3">
            Secure Digital Checkout Gateway
          </h1>
          <p className="text-xs text-slate-400">Fill in information to authorize high-security eBook transfer protocol keys.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Customer Details Form */}
          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 space-y-6 shadow-2xl">
            
            <form onSubmit={handleCheckoutSubmit} className="space-y-6 text-left">
              
              <div className="space-y-4">
                <h3 className="font-bold text-xs font-mono uppercase tracking-widest text-emerald-400 border-b border-white/5 pb-2">
                  1. License Holder Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label id="lbl-cust-name" className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">First & Last Name</label>
                    <input
                      id="checkout-cust-name"
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label id="lbl-cust-email" className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Deliverability License Email</label>
                    <input
                      id="checkout-cust-email"
                      type="email"
                      required
                      placeholder="jane.doe@company.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-450 block mt-1 leading-tight">Must match your user profile login for lifetime download access.</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods selector */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs font-mono uppercase tracking-widest text-emerald-405 border-b border-white/5 pb-2">
                  2. Choose Instant Payment Gateway Method
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Card', label: 'Debit / Credit Card', icon: '💳' },
                    { id: 'Razorpay', label: 'Razorpay Secure', icon: '🔥' },
                    { id: 'Stripe', label: 'Stripe Gateway', icon: '⚡' },
                    { id: 'PayPal', label: 'PayPal Instant', icon: '🅿️' },
                    { id: 'UPI', label: 'GooglePay / UPI', icon: '📲' },
                    { id: 'NetBanking', label: 'Net Banking transfer', icon: '🏦' }
                  ].map(gate => (
                    <button
                      id={`gateway-select-${gate.id}`}
                      key={gate.id}
                      type="button"
                      onClick={() => setPaymentMethod(gate.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-20 ${
                        paymentMethod === gate.id 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500' 
                          : 'border-white/10 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{gate.icon}</span>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-100 leading-none">{gate.label}</span>
                        <span className="text-[8px] font-mono text-emerald-400 uppercase font-semibold">100% Free Transfer</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-slate-900/40 text-[11px] text-slate-400 border border-white/5 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p>
                    Payments are direct-credited instantly under safe TLS/encryption protocols to author Ayush's configured standard bank account details. This is a fully operational digital payment simulator.
                  </p>
                </div>
              </div>

              {/* Submit Checkout button */}
              <button
                id="submit-payment-btn"
                type="submit"
                disabled={submittingPayment}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-sm rounded-xl tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 font-mono"
              >
                <CheckCircle className="h-5 w-5" />
                {submittingPayment ? "Securing connection..." : `Authorize Payment of $${netTotal}`}
              </button>

            </form>

          </div>

          {/* Checkout Review right bar */}
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/5 space-y-4 text-left font-sans shadow-2xl">
            <h3 className="font-bold text-sm tracking-tight text-slate-50 pb-2 border-b border-white/5">
              Checkout eBooks Details ({cart.length})
            </h3>

            <div className="divide-y divide-white/5 max-h-56 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.book.id} className="py-2.5 flex items-center gap-3">
                  <div className="h-12 w-8 bg-black/10 rounded overflow-hidden">
                    <BookCover title={item.book.title} category={item.book.category} size="sm" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[9px] font-bold text-emerald-400 block leading-tight font-mono">{item.book.category}</span>
                    <h4 className="font-semibold text-xs text-slate-205 truncate">{item.book.title}</h4>
                    <span className="text-[10px] text-slate-450 font-mono">Qty: {item.quantity} x ${item.book.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-white/5 my-2" />

            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Voucher Subtotal</span>
                <span>${cartTotal}</span>
              </div>
              {discountApplied > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Voucher Code Active</span>
                  <span>-${discountApplied}</span>
                </div>
              )}
              <div className="h-px bg-white/5 my-1" />
              <div className="flex justify-between text-sm text-slate-100 font-extrabold font-sans">
                <span>Calculated Net Total</span>
                <span className="font-mono text-emerald-400">${netTotal}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center text-center gap-1 text-[10px] text-slate-450 font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-450" />
              <span>TLS AES-256 Bit Secure Connection verified</span>
           </div>

          </div>

        </div>
      </div>
    );
  }

  // SUCCESS THANK YOU PAGE HANDLER
  const orderReceipt = finalOrder || {
    customerName: customerName,
    customerEmail: customerEmail,
    books: [],
    totalPrice: netTotal,
    paymentMethod: paymentMethod,
    transactionId: "TXN_SIM_SUCCESS",
    receiptNumber: "REC-2026-MOCK",
    date: new Date().toISOString()
  };

  return (
    <div className="max-w-xl mx-auto py-8 animate-fade-in text-center space-y-8">
      
      {/* Circle animation success check */}
      <div className="flex justify-center flex-col items-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl shadow-lg border border-emerald-500/20 animate-bounce">
          ✓
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
          Thank you for your purchase!
        </h1>
        <p className="text-xs text-slate-400 leading-normal max-w-sm">
          Your payment has been successfully credited direct to Ayush's bank account. Access key licenses have been dynamically provisioned to your profile!
        </p>
      </div>

      {/* Official printable Receipt invoice card */}
      <div className="p-6 glass-card border border-white/10 rounded-2xl text-left shadow-2xl space-y-4 font-sans relative overflow-hidden">
        {/* Zebra lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />
        
        <div className="flex justify-between items-center pb-2 border-b border-white/5 mt-2">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-emerald-400 block uppercase font-bold">Ayush Library Invoice</span>
            <h3 className="font-extrabold text-xs text-slate-200">Official Purchase Receipt</h3>
          </div>
          <Receipt className="h-6 w-6 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-[9px] text-slate-450 block uppercase">Recipient Customer</span>
            <span className="font-sans font-bold text-slate-200 block">{orderReceipt.customerName}</span>
            <span className="text-slate-404 leading-none">{orderReceipt.customerEmail}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-450 block uppercase">Receipt Reference Code</span>
            <span className="font-bold text-slate-200 block">{orderReceipt.receiptNumber}</span>
            <span className="text-[10px] text-slate-400 block">Date: {new Date(orderReceipt.date).toLocaleDateString('en-US')}</span>
          </div>
        </div>

        <div className="h-px bg-white/5 my-2" />

        <div className="space-y-2 text-xs">
          <span className="text-[9px] font-mono text-slate-400 block uppercase">Licensed eBooks Purchased</span>
          <div className="divide-y divide-white/5">
            {orderReceipt.books && orderReceipt.books.map((b: any, index: number) => (
              <div key={index} className="py-2 flex justify-between items-center font-sans">
                <div>
                  <h4 className="font-bold text-xs text-slate-100 leading-tight">{b.title}</h4>
                  <span className="text-[9px] font-mono text-emerald-400">Lifetime Access Key assigned</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-100">${b.price}</span>
                  {/* Download Direct button linking to PDF attachment securely */}
                  <a
                    id={`download-sec-rec-${b.id}`}
                    href={`/api/download/${b.id}?email=${orderReceipt.customerEmail}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-emerald-400 hover:text-zinc-950 hover:bg-emerald-500 rounded border border-emerald-500/20 transition-all"
                    title="Instant download copy"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/5 my-2" />

        {/* Transaction tracking IDs */}
        <div className="flex justify-between items-center text-xs">
          <div className="font-mono text-[9px] text-slate-450">
            <span className="block uppercase">Payment: {orderReceipt.paymentMethod} Gateway</span>
            <span className="block leading-none">Trace ID: {orderReceipt.transactionId}</span>
          </div>
          <div className="text-right font-sans">
            <span className="text-[9px] text-slate-450 block font-mono uppercase">Calculated net total</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">${orderReceipt.totalPrice}</span>
          </div>
        </div>

      </div>

      {/* Access Instructions */}
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs space-y-2 text-left backdrop-blur-sm">
        <h4 className="font-bold text-emerald-400 flex items-center gap-1 font-mono">
          <Gift className="h-4 w-4" />
          Where do I view my purchased eBooks?
        </h4>
        <p className="text-slate-350 leading-normal">
          You can download your eBook files directly from this invoice receipt. They have also been saved permanently to your <strong>My Library</strong> digital bookshelf. Login or register using your checkout email (<strong>{orderReceipt.customerEmail}</strong>) in the top nav to view and download all your purchases anytime in the future!
        </p>
      </div>

      {/* Control redirect triggers */}
      <div className="flex flex-wrap gap-3 justify-center pt-2 font-mono">
        <button
          id="rec-go-library"
          onClick={() => {
            // Log in customer automatically for rapid prototyping interaction
            setView('my-library');
          }}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          Access My Library Bookshelf
        </button>
        <button
          id="rec-go-shop"
          onClick={() => setView('shop')}
          className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
        >
          Return to eBook Shop
        </button>
      </div>

    </div>
  );
}
