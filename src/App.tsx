/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import Navigation from './components/Navigation.js';
import Footer from './components/Footer.js';
import Storefront from './components/Storefront.js';
import ProductDetails from './components/ProductDetails.js';
import Checkout from './components/Checkout.js';
import CustomerPortal from './components/CustomerPortal.js';
import AdminPortal from './components/AdminPortal.js';
import PublicPages from './components/PublicPages.js';

function LibraryAppLayout() {
  const { activeView } = useApp();

  // Dynamic router based on the active tab view string
  const renderActiveView = () => {
    switch (activeView) {
      // Catalog Storefronts
      case 'home':
      case 'shop':
        return <Storefront />;
      
      // Detailed Product Info
      case 'product-details':
        return <ProductDetails />;
      
      // Buying checkout flows
      case 'cart':
      case 'checkout':
        return <Checkout />;
      
      // Reader Profiles auth & bookshelves
      case 'customer-login':
      case 'customer-register':
      case 'my-library':
      case 'customer-dashboard':
        return <CustomerPortal />;

      // Owner dashboard administration panels
      case 'admin-login':
      case 'admin-dashboard':
      case 'product-management':
      case 'price-management':
      case 'payment-settings':
      case 'bank-details':
      case 'analytics-dashboard':
      case 'customer-management':
      case 'orders-management':
        return <AdminPortal />;

      // Supplementary Pages
      case 'reviews':
      case 'contact':
      case 'about-author':
        return <PublicPages />;

      default:
        return <Storefront />;
    }
  };

  return (
    <div 
      id="library-layout-wrapper" 
      className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative overflow-x-hidden"
    >
      {/* Glow Orbs Backdrop */}
      <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-indigo-600/10 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none select-none"></div>
      <div className="absolute bottom-[5%] right-[-5%] w-[450px] h-[450px] sm:w-[700px] sm:h-[700px] bg-emerald-500/5 rounded-full blur-[110px] sm:blur-[150px] pointer-events-none select-none"></div>
      <div className="absolute top-[35%] right-[10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none select-none"></div>

      {/* Dynamic Navigation Bar Header */}
      <Navigation />

      {/* Main Responsive View Container Segment */}
      <main id="library-main-content" className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10 relative">
        <div className="w-full max-w-none prose prose-invert">
          {renderActiveView()}
        </div>
      </main>

      {/* Dynamic Footer section */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <LibraryAppLayout />
    </AppProvider>
  );
}
