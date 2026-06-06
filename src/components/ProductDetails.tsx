/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { BookCover } from './Storefront.js';
import { Book } from '../types.js';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  FileText, 
  BookOpen, 
  Download, 
  Send,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';

export default function ProductDetails() {
  const { 
    selectedBookId, 
    setView, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    showToast,
    refreshBooks,
    books
  } = useApp();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states for reviews
  const [reviewerName, setReviewerName] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch book details from backend (which records a page view trace)
  const fetchBookDetails = async () => {
    if (!selectedBookId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${selectedBookId}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      } else {
        showToast("Error retrieving book information", "error");
        setView('shop');
      }
    } catch (e) {
      showToast("Network connection issue getting eBook specifications", "error");
      setView('shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [selectedBookId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !commentInput.trim() || !book) {
      showToast("Please provide review name and feedback comments.", "warning");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/books/${book.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName,
          rating: ratingInput,
          comment: commentInput
        })
      });

      if (res.ok) {
        showToast("Review submitted successfully! Thank you for sharing your feedback.", "success");
        setReviewerName('');
        setCommentInput('');
        setRatingInput(5);
        // Sync parent catalog and reload details locally
        await refreshBooks();
        await fetchBookDetails();
      } else {
        showToast("Failed to process customer review submission", "error");
      }
    } catch (e) {
      showToast("Server failure during review database write", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Instant direct Checkout
  const handleBuyNow = () => {
    if (!book) return;
    // Empty checkout state or just load direct item to cart, then route
    addToCart(book);
    setView('checkout');
  };

  if (loading || !book) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        <p className="text-xs text-slate-400 font-mono">Retrieving encrypted book documentation...</p>
      </div>
    );
  }

  const isInWishlist = wishlist.some(b => b.id === book.id);

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left">
      
      {/* Back to Shop Nav bar */}
      <div>
        <button
          id="back-to-shop-btn"
          onClick={() => setView('shop')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-all cursor-pointer font-mono"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookstore Catalog
        </button>
      </div>

      {/* Main product showcase section */}
      <section id="book-spec-section" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Editorial Book Cover Card */}
        <div className="md:col-span-4 flex justify-center sticky top-24">
          <div className="glass-card p-8 rounded-3xl border border-white/10 flex justify-center shadow-2xl w-full max-w-sm">
            <BookCover title={book.title} category={book.category} size="lg" />
          </div>
        </div>

        {/* Right Side: Detailed specs and buttons */}
        <div className="md:col-span-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
              {book.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-50 font-sans">
              {book.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono">Written and published by developer {book.author}</p>
          </div>

          {/* Core Specs metrics pill row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl glass-card border border-white/5 shadow-xl">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Average Rating</span>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-amber-400 font-bold">
                <Star className="h-4 w-4 fill-current text-amber-400" />
                <span>{book.rating}</span>
                <span className="text-[10px] text-slate-450 font-normal">({book.ratingsCount})</span>
              </div>
            </div>
            
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Total Print size</span>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-slate-200 font-bold">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>{book.pages} Pages</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold font-mono">Download Volume</span>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-slate-200 font-bold">
                <FileText className="h-4 w-4 text-emerald-400" />
                <span>{book.fileSize}</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Deliverability</span>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-emerald-405 font-bold">
                <Download className="h-4 w-4" />
                <span>Instant PDF</span>
              </div>
            </div>
          </div>

          {/* Book Summary Description Text */}
          <div className="space-y-2">
            <h3 className="font-semibold text-xs font-mono uppercase tracking-widest text-emerald-400">Product Synopsis</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {book.description}
            </p>
          </div>

          {/* Trust points card */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3 backdrop-blur-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-100">Ayush's Author Lifetime License Guarantee</h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                Includes active lifetime updates! Whenever Ayush updates the contents of this study guide, you can re-download the latest revision directly with no additional purchase codes.
              </p>
            </div>
          </div>

          {/* Checkout controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/5 pt-6">
            <div className="text-center sm:text-left">
              <span className="text-xs font-mono text-slate-450 block uppercase tracking-wider">Purchase Price</span>
              <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                ${book.price}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto font-mono">
              <button
                id="wishlist-toggle-detail"
                onClick={() => toggleWishlist(book)}
                className={`p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer ${
                  isInWishlist ? 'text-rose-500 border-rose-500/40 bg-rose-500/10' : 'text-slate-400'
                }`}
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>

              <button
                id="add-cart-detail"
                onClick={() => addToCart(book)}
                className="flex-grow sm:flex-grow-0 px-6 py-3 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Shopping Cart
              </button>

              <button
                id="buy-now-detail"
                onClick={handleBuyNow}
                className="flex-grow sm:flex-grow-0 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 animate-pulse"
              >
                <Sparkles className="h-4 w-4 text-zinc-950" />
                Buy Now
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Reviews and feedbacks segment */}
      <section id="reviews-segment" className="border-t border-white/5 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Write a Review Submission Form */}
        <div className="lg:col-span-12 xl:col-span-5 glass-card p-6 rounded-2xl border border-white/5 shadow-2xl space-y-4">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              <MessageSquare className="h-3.5 w-3.5" />
              Write feedback
            </div>
            <h3 className="font-bold text-sm tracking-tight text-slate-50">Submit Your eBook Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We value human reader feedback. Let us and future engineers know how Ayush's guide helped your software blueprints.
            </p>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div>
              <label id="lbl-rev-name" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Your Full Name</label>
              <input
                id="reviewer-name-input"
                type="text"
                required
                placeholder="Jane Doe or Siddharth"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full text-xs font-sans px-3 py-2 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label id="lbl-rev-rating" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Rating Stars</label>
              <div className="flex items-center gap-1.5 p-2 bg-slate-900/40 border border-white/5 rounded-xl">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    id={`rating-input-${num}`}
                    key={num}
                    type="button"
                    onClick={() => setRatingInput(num)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`h-6 w-6 ${num <= ratingInput ? 'fill-current text-amber-400' : 'text-zinc-800'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-205 ml-2 font-mono">{ratingInput}★ Rated</span>
              </div>
            </div>

            <div>
              <label id="lbl-rev-comment" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">Review Comments</label>
              <textarea
                id="review-comment-textarea"
                rows={4}
                required
                placeholder="Share your thoughts. What concepts did you like most? Was the code repository helpful?"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full text-xs font-sans px-3 py-2 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              id="submit-review-btn"
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-extrabold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Send className="h-3.5 w-3.5" />
              {submittingReview ? "Saving review..." : "Submit Review Data"}
            </button>
          </form>
        </div>

        {/* Public Reviews List */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-bold text-sm tracking-tight text-slate-50">
              Reader Feedback List ({book.reviews.length})
            </h3>
            <span className="text-xs font-mono text-slate-400">Verified purchasers only</span>
          </div>

          {book.reviews.length > 0 ? (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {book.reviews.map(rev => (
                <div 
                  key={rev.id}
                  className="p-4 rounded-xl glass-card border border-white/5 space-y-2 text-left shadow-lg"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {rev.reviewerName.substring(0, 2).toUpperCase()}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-200">{rev.reviewerName}</h4>
                    </div>
                    
                    <span className="text-[9px] font-mono text-slate-400">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-mono">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current text-amber-500' : 'text-zinc-800'}`} />
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-2 border border-white/5 border-dashed rounded-xl">
              <MessageSquare className="h-10 w-10 text-slate-450 mx-auto" />
              <h4 className="font-semibold text-xs text-slate-300">No Reader Reviews</h4>
              <p className="text-[11px] text-slate-450 font-mono">Be the first verified reader to review this eBook! Complete the form to submit.</p>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
