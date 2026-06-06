/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { Book } from '../types.js';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ShoppingBag, 
  Heart, 
  Star, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  BookOpenText, 
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';

// Reusable elegant SVG Cover Generator for professional design!
export function BookCover({ title, category, size = 'default' }: { title: string; category: string; size?: 'sm' | 'default' | 'lg' }) {
  // Generate a distinct styled gradient based on the first character
  const gradients = [
    'from-indigo-600 via-indigo-700 to-purple-800',
    'from-slate-800 via-slate-900 to-zinc-950',
    'from-emerald-600 via-emerald-700 to-teal-800',
    'from-teal-700 via-teal-800 to-cyan-900',
    'from-amber-600 via-orange-700 to-red-850',
    'from-purple-600 via-fuchsia-700 to-pink-800'
  ];
  
  const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const selectedGradient = gradients[charSum % gradients.length];

  const heightClass = size === 'sm' ? 'h-36 w-24' : size === 'lg' ? 'h-72 w-52' : 'h-56 w-36';

  return (
    <div 
      className={`relative ${heightClass} rounded-r-xl shadow-md overflow-hidden bg-gradient-to-br ${selectedGradient} flex flex-col justify-between p-3.5 text-white border-l-4 border-black/35 transform hover:scale-[1.02] transition-transform duration-250 select-none`}
    >
      {/* Visual background lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-1/2 h-1/2 rounded-full bg-white/5 blur-xl pointer-events-none" />
      
      {/* Header Category Tag */}
      <div className="flex justify-between items-start z-10">
        <span className="text-[9px] font-mono tracking-widest uppercase bg-white/10 dark:bg-black/20 px-1.5 py-0.5 rounded backdrop-blur-sm truncate max-w-full">
          {category}
        </span>
        <Sparkles className="h-3 w-3 text-amber-300 opacity-80" />
      </div>

      {/* Main Title Typography */}
      <div className="my-auto z-10 space-y-1.5">
        <h3 className={`font-serif tracking-tight leading-tight ${size === 'lg' ? 'text-lg font-bold' : size === 'sm' ? 'text-xs font-semibold' : 'text-sm font-bold'} break-words line-clamp-4`}>
          {title}
        </h3>
        <div className="h-0.5 w-6 bg-amber-400 rounded" />
      </div>

      {/* Footer Publishing Label */}
      <div className="flex justify-between items-end z-10 mt-2">
        <span className="text-[9px] font-mono tracking-widest opacity-75 uppercase">
          BY AYUSH
        </span>
        <BookOpenText className="h-3.5 w-3.5 opacity-60" />
      </div>

      {/* Book Spine Shadow Edge */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

export default function Storefront() {
  const { 
    books, 
    activeView, 
    setView, 
    setSelectedBookId, 
    addToCart, 
    wishlist, 
    toggleWishlist 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState<'price-asc' | 'price-desc' | 'rating' | 'popular'>('popular');

  // Categories extracted from active book records
  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  // Increments view count dynamically via server API
  const handleBookClick = async (bookId: string) => {
    setSelectedBookId(bookId);
    setView('product-details');
    try {
      fetch(`/api/books/${bookId}/views`, { method: 'POST' });
    } catch (e) {}
  };

  // Searching, category filtering & sorting logic
  const filteredBooks = books
    .filter(book => {
      const matchSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'All' || book.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'rating') return b.rating - a.rating;
      return b.salesCount - a.salesCount; // Popularity fallback
    });

  const featuredBooks = books.slice(0, 3); // top 3 for home display

  if (activeView === 'home') {
    return (
      <div className="space-y-16 py-4 animate-fade-in">
        
        {/* Professional Cover Header Hero Banner */}
        <section id="hero-banner-section" className="relative rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl">
          {/* Ambient glowing accents */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-indigo-500/5 to-slate-950/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.06),transparent_50%)] pointer-events-none" />
          
          <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-20 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
            <div className="md:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-400 font-mono">
                <Sparkles className="h-3.5 w-3.5" />
                <span>100% SECURE DIGITAL EBOOKSTORE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans leading-none text-slate-50">
                Expand Your Engineering Scope with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 to-indigo-400">Modern Digital Guides</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Written and curated by senior author <strong className="text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded">Ayush</strong>. Get immediate lifetime download access to pristine technical manuals covering clean software designs, frameworks configurations, database architectures, and engineering self-improvement logs.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button 
                  id="hero-go-shop"
                  onClick={() => setView('shop')}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl tracking-wide transition-all shadow-lg shadow-emerald-500/15 cursor-pointer flex items-center gap-1 group"
                >
                  Explore Storefront
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  id="hero-go-author"
                  onClick={() => setView('about-author')}
                  className="px-5 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Meet the Author (Ayush)
                </button>
              </div>
            </div>

            {/* Showcase Visual Covers stack */}
            <div className="hidden md:flex md:col-span-5 justify-center relative h-80">
              {books.slice(0, 2).map((book, idx) => (
                <div 
                  key={book.id} 
                  className="absolute transition-transform duration-300 cursor-pointer"
                  style={{
                    transform: `translateX(${(idx - 0.5) * 60}px) rotate(${(idx - 0.5) * 8}deg) scale(${1 - Math.abs(idx - 0.5) * 0.15})`,
                    zIndex: 20 - idx,
                    top: idx === 0 ? '5px' : '30px'
                  }}
                  onClick={() => handleBookClick(book.id)}
                >
                  <BookCover title={book.title} category={book.category} size="lg" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="trust-features-section" className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          <div className="p-6 rounded-2xl glass-card text-left space-y-3 shadow-xl hover:scale-[1.01] transition-transform">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-100 font-sans text-sm">Author Express Pricing</h3>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              No middle publishers. Buying direct from Ayush guarantees the lowest price margin for the highest quality learning materials.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl glass-card text-left space-y-3 shadow-xl hover:scale-[1.01] transition-transform">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-100 font-sans text-sm font-sans">Instant Secure Access</h3>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              As soon as payment approves, your unique eBook is ready for instant secure download in your secure "My Library" dashboard panel.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card text-left space-y-3 shadow-xl hover:scale-[1.01] transition-transform">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-100 font-sans text-sm font-sans">Anti-Sharing Guarantee</h3>
            <p className="text-xs text-slate-350 leading-relaxed font-sans">
              Purchases are embedded with secure license encryption hashes matched to customer checkouts, preventing piracy.
            </p>
          </div>
        </section>

        {/* Featured eBooks Slider */}
        <section id="featured-books-slider" className="space-y-6 max-w-7xl mx-auto px-4 text-left">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-50 tracking-tight">Best Selling Guides</h2>
              <p className="text-xs text-slate-400">Industry favorites and highly recommended software manuals</p>
            </div>
            <button 
              id="featured-books-btn-shop"
              onClick={() => setView('shop')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-350 hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              See All Shop Items
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBooks.map(book => {
              const isWish = wishlist.some(b => b.id === book.id);
              return (
                <div 
                  key={book.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl glass-card-hover border border-white/5 shadow-xl transition-all"
                >
                  <div className="flex-shrink-0 mx-auto sm:mx-0 cursor-pointer" onClick={() => handleBookClick(book.id)}>
                    <BookCover title={book.title} category={book.category} size="sm" />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between text-left space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {book.category}
                        </span>
                        
                        <button
                          id={`wish-${book.id}`}
                          onClick={() => toggleWishlist(book)}
                          className={`p-1.5 rounded-full cursor-pointer hover:bg-white/5 transition-colors ${isWish ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                      
                      <h3 
                        onClick={() => handleBookClick(book.id)}
                        className="text-sm font-extrabold tracking-tight text-slate-50 line-clamp-2 hover:text-emerald-400 cursor-pointer transition-colors"
                      >
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">By {book.author}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium font-mono">
                      <Star className="h-3 w-3 fill-current text-amber-400" />
                      <span>{book.rating}</span>
                      <span className="text-slate-450 text-[10px]">({book.ratingsCount} reviews)</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-md font-extrabold text-slate-100 font-mono">
                        ${book.price}
                      </span>
                      <button
                        id={`add-cart-feat-${book.id}`}
                        onClick={() => addToCart(book)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-emerald-500/10"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Customer Testimonial Panel */}
        <section id="customer-testim-section" className="bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 backdrop-blur-md border border-white/5 rounded-3xl py-10 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-left shadow-2xl">
          <div className="space-y-2 md:max-w-md">
            <h2 className="text-xl font-bold tracking-tight text-slate-100">Trusted by 10,000+ Developers</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Engineers from bigtech conglomerates down to boutique startups utilize Ayush's engineering series to streamline workflows and deploy optimal cloud-native apps.
            </p>
          </div>
          
          <div className="w-full md:max-w-lg glass-card p-6 rounded-2xl border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="italic text-xs text-slate-300">
              "Ayush's Clean Architecture blueprint fundamentally clarified how we modularize our state handlers. Clean, type-safe, and 100% focused on immediate developer implementation."
            </p>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-extrabold text-xs">
                JD
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-205">John Doe</h4>
                <p className="text-[10px] text-slate-450 font-mono">Senior Dev, Cloudscale Corp</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    );
  }

  // SHOPPING STOREFRONT VIEW PAGE
  return (
    <div className="space-y-8 py-4 animate-fade-in text-left">
      
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 font-sans bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent inline-block">
          The Ayush eBookstore Collection
        </h1>
        <p className="text-xs text-slate-400">
          Find your next reference manual. Real insights, strict typing rules, and clear templates.
        </p>
      </div>

      {/* Control filter panel bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl shadow-xl border border-white/5">
        
        {/* Search Search Box Input */}
        <div className="relative w-full sm:max-w-xs block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="shop-search-input"
            type="text"
            placeholder="Search titles, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Categories toggler */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          <Filter className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          {categories.map(cat => (
            <button
              id={`cat-filter-${cat}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                selectedCategory === cat 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-350'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select options dropdown */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <select
            id="sort-select-dropdown"
            value={sortOption}
            onChange={(e: any) => setSortOption(e.target.value)}
            className="w-full sm:w-auto bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer backdrop-blur-md"
          >
            <option value="popular">Best Selling / Popular</option>
            <option value="rating">Highest Rated Score</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Grid listing eBooks */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => {
            const isWish = wishlist.some(b => b.id === book.id);
            return (
              <div 
                key={book.id}
                className="group flex flex-col justify-between rounded-2xl p-4 glass-card-hover border border-white/5 shadow-xl relative transition-all"
              >
                {/* Wishlist toggle anchor */}
                <button
                  id={`wishlist-toggle-${book.id}`}
                  onClick={() => toggleWishlist(book)}
                  className="absolute top-3 right-3 z-15 p-1.5 rounded-full bg-slate-900/80 border border-white/10 hover:scale-105 transition-all text-slate-400 cursor-pointer"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>

                {/* Cover representation */}
                <div 
                  className="mx-auto cursor-pointer relative overflow-hidden rounded-r-xl"
                  onClick={() => handleBookClick(book.id)}
                >
                  <BookCover title={book.title} category={book.category} size="default" />
                </div>

                {/* Metadata content */}
                <div className="space-y-3 mt-4 text-left flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                      {book.category}
                    </span>
                    
                    <h3 
                      onClick={() => handleBookClick(book.id)}
                      className="text-xs font-extrabold font-sans text-slate-100 group-hover:text-emerald-400 transition-colors mt-1 leading-snug line-clamp-2 cursor-pointer"
                    >
                      {book.title}
                    </h3>

                    <p className="text-[10px] text-slate-450 font-mono">By {book.author}</p>
                  </div>

                  {/* Rating row */}
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold pt-1 font-mono">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < Math.floor(book.rating) 
                              ? 'fill-current text-amber-500' 
                              : 'text-zinc-800'
                          }`} 
                        />
                      ))}
                    </div>
                    <span>{book.rating}</span>
                    <span className="text-slate-450 text-[9px]">({book.ratingsCount})</span>
                  </div>

                  {/* Price and Cart checkout triggers */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                    <span className="text-sm font-extrabold text-slate-50 font-mono">
                      ${book.price}
                    </span>
                    <button
                      id={`add-cart-list-${book.id}`}
                      onClick={() => addToCart(book)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-emerald-500/10"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Add
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div id="no-books-fallback" className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <Inbox className="h-12 w-12 text-slate-450" />
          <h3 className="font-semibold text-sm text-slate-100">No eBooks Detected</h3>
          <p className="text-xs text-slate-450 max-w-sm">No items in store fit search queries or category tags. Please try clearing search tokens.</p>
          <button 
            id="clear-store-filters"
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} 
            className="px-4 py-2 text-xs font-extrabold text-zinc-950 bg-emerald-500 rounded-lg"
          >
            Reset Catalog Grid
          </button>
        </div>
      )}

    </div>
  );
}
