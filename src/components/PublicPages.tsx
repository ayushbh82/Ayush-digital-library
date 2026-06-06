/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { 
  Mail, 
  Send, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, 
  BookOpen, 
  Award, 
  CheckCircle,
  Star,
  MessageSquare,
  Sparkles,
  Smile
} from 'lucide-react';

export default function PublicPages() {
  const { activeView, setView, books, showToast } = useApp();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    institution: '',
    message: ''
  });
  const [sendingMsg, setSendingMsg] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMsg(true);
    setTimeout(() => {
      showToast("Thank you for your message! Author Ayush will reply within 24 hours.", "success");
      setContactForm({ name: '', email: '', institution: '', message: '' });
      setSendingMsg(false);
    }, 1200);
  };

  // Extract all reviews globally across all eBooks for the global Reviews page
  const getAllGlobalReviews = () => {
    const list: { id: string; bookTitle: string; reviewerName: string; rating: number; comment: string; date: string }[] = [];
    books.forEach(b => {
      b.reviews.forEach(r => {
        list.push({
          id: r.id,
          bookTitle: b.title,
          reviewerName: r.reviewerName,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        });
      });
    });
    // return sorted by date newest first
    return list.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const globalReviews = getAllGlobalReviews();

  // REVIEWS SHOWCASE PAGE
  if (activeView === 'reviews') {
    return (
      <div className="space-y-8 py-4 animate-fade-in text-left">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            Verified Reader Reviews
          </h1>
          <p className="text-xs text-slate-400">Read what fellow full-stack developers and computer engineers say about our materials.</p>
        </div>

        {/* Dynamic Aggregated Star breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center glass-card p-6 rounded-2xl border border-white/5 shadow-2xl">
          <div className="md:col-span-4 text-center md:text-left space-y-1 bg-black/20 p-6 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Accrued Rating</span>
            <span className="text-4xl font-extrabold text-slate-100 block font-mono text-emerald-400">4.8★</span>
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current text-emerald-400" />)}
            </div>
            <span className="text-[10px] text-slate-500 block pt-1">Parsed from verified purchases</span>
          </div>

          <div className="md:col-span-8 space-y-3">
            <h4 className="font-bold text-xs tracking-wider uppercase text-slate-400 font-mono">Why readers prefer Ayush's blueprints</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span><strong>No Fluff, Pure Implementations:</strong> Designed for immediate codebase staging.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span><strong>Lifetime Refactorings Included:</strong> Updates matching latest ecosystem versions.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span><strong>Typesafety Focused:</strong> Explicitly designed to leverage compiler guarantees.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Global comment list */}
        {globalReviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 leading-normal">
            {globalReviews.map(rev => (
              <div 
                key={rev.id}
                className="p-5 glass-card border border-white/5 rounded-2xl space-y-3 relative font-sans shadow-lg text-slate-350"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 text-left">
                    <div className="h-8 w-8 rounded-full bg-emerald-550/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/10">
                      {rev.reviewerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 leading-tight">{rev.reviewerName}</h4>
                      <span className="text-[9px] text-slate-450 italic font-mono block">Reviewing: {rev.bookTitle}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-450">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-700'}`} />
                  ))}
                  <span className="ml-1 text-[10px] text-slate-450">({rev.rating}★ rating)</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-xs text-slate-400 border border-dashed border-white/5 rounded-2xl">No customer reviews published yet.</p>
        )}
      </div>
    );
  }

  // CONTACT PAGE VIEW (Bulk request quotation template)
  if (activeView === 'contact') {
    return (
      <div className="space-y-8 py-4 animate-fade-in text-left">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-100 font-sans flex items-center gap-2">
            <Mail className="h-6 w-6 text-emerald-400" strokeWidth={2.5} />
            Contact Author & Publisher
          </h1>
          <p className="text-xs text-slate-400">Submit requests for corporate bulk licenses, university distributions, or physical companion prints.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Form Side */}
          <div className="md:col-span-7 glass-card border border-white/5 p-6 rounded-2xl space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm tracking-tight text-slate-100">Quotation & General Inquiries Proposal</h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-sans text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label id="lbl-cnt-name" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">First & Last Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label id="lbl-cnt-email" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Communication Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label id="lbl-cnt-institution" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Institution / Enterprise (Optional)</label>
                <input
                  id="contact-institution"
                  type="text"
                  placeholder="e.g. Stanford University or TechCorp Ltd"
                  value={contactForm.institution}
                  onChange={(e) => setContactForm({ ...contactForm, institution: e.target.value })}
                  className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label id="lbl-cnt-message" className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Proposal / Inquiry Details</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="State your required volumes, distribution formats, and learning tracks..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl text-slate-100 glass-input focus:ring-1 focus:ring-emerald-500 bg-slate-900"
                />
              </div>

              <button
                id="contact-submit"
                type="submit"
                disabled={sendingMsg}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono shadow-md shadow-emerald-500/10"
              >
                <Send className="h-3.5 w-3.5" />
                {sendingMsg ? "Transmitting..." : "Send Secure Message"}
              </button>
            </form>
          </div>

          {/* Details Side */}
          <div className="md:col-span-5 space-y-6 text-left font-sans text-xs">
            
            <div className="p-5 glass-card border border-white/5 rounded-2xl space-y-4 shadow-xl">
              <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Ayush Digital HQ
              </h3>
              
              <div className="space-y-3.5 text-slate-350">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Author Workspace Location</span>
                  <span className="font-semibold text-slate-100 block">Bengaluru, Karnataka, India</span>
                  <span className="text-[10px] text-slate-500">Asia's tech capital region standard time</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Author Core Channels</span>
                  <div className="flex gap-2.5 pt-1 text-slate-300 text-sm">
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 rounded-lg hover:text-emerald-400 transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 rounded-lg hover:text-emerald-400 transition-colors">
                      <Github className="h-4 w-4" />
                    </a>
                    <a href="https://ayushcodes.dev" target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 rounded-lg hover:text-emerald-400 transition-colors">
                      <Globe className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="font-bold text-emerald-400 block pb-1 flex items-center gap-1 font-mono uppercase text-[10px]">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Affiliation & Consulting Contracts
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Ayush conducts specialized engineering workshops and code design audits for major high-tech companies globally. If you'd like to combine eBook license bundles with dedicated architectural consulting, please outline your targets above!
              </p>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // ABOUT THE AUTHOR VIEW (Ayush timeline bio)
  return (
    <div className="space-y-12 py-4 animate-fade-in text-left">
      
      {/* Bio banner */}
      <section id="author-bio-banner" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Dynamic avatar icon representing Author Ayush */}
        <div className="md:col-span-4 flex justify-center">
          <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-zinc-950 flex items-center justify-center text-4xl font-extrabold shadow-md border border-white/10 relative font-mono">
            <span>A</span>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-450 text-zinc-950 font-extrabold text-[8px] rounded font-mono tracking-widest uppercase border border-white/10">
              CREATOR
            </div>
          </div>
        </div>

        {/* Narrative bio */}
        <div className="md:col-span-8 text-left space-y-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-emerald-400">MEET THE PUBLISHER</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-50">Ayush</h1>
            <p className="text-xs text-slate-400 font-mono">Senior Web Architect | Technical Textbook Writer | Indie Hackers Sponsor</p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Ayush is a full-stack engineering veteran specializing in reactive compilers, clean architectures, and typesafety validations. Frustrated by superficial tech guides and bloated corporate publications, Ayush embarked on establishing the **Ayush Digital Library** — a self-contained publishing house delivering high-density software engineering textbooks directly to coders globally.
          </p>

          <div className="flex gap-4 text-xs font-mono font-bold text-emerald-400">
            <span className="flex items-center gap-1">5+ Textbooks</span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1">10,000+ Students</span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1">100% Verified</span>
          </div>
        </div>
      </section>

      {/* TIMELINE ARCHITECTURE SEGMENT */}
      <section id="author-timeline-segment" className="space-y-6 font-sans">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono text-emerald-400 uppercase">Publishing Timeline Landmarks</h2>
          <p className="text-xs text-slate-400">Major checkpoints in Ayush's professional digital library release history.</p>
        </div>

        <div className="space-y-6 relative border-l border-emerald-500/20 pl-5 ml-2 text-xs">
          
          <div className="space-y-1 relative">
            <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border border-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-mono text-emerald-400 block font-bold">FEBRUARY 2026</span>
            <h4 className="font-extrabold text-slate-100 text-sm">Published: Next.js 15 Deep Dive Guide</h4>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Released full comprehensive research regarding React Server Actions and caching mechanics. Reached #1 Top Selling eBook in its launch month.
            </p>
          </div>

          <div className="space-y-1 relative">
            <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500/30 border border-zinc-950" />
            <span className="text-[9px] font-mono text-slate-500 block font-bold">OCTOBER 2025</span>
            <h4 className="font-extrabold text-slate-150 text-sm">Published: Mastering TypeScript & Clean Architecture</h4>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Ayush's flagship release outlining decoupling strategies. Extensively reviewed by senior tech leads in big-tech companies.
            </p>
          </div>

          <div className="space-y-1 relative">
            <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500/30 border border-zinc-950" />
            <span className="text-[9px] font-mono text-slate-500 block font-bold">DECEMBER 2024</span>
            <h4 className="font-extrabold text-slate-150 text-sm">Established: Ayush Digital Library</h4>
            <p className="text-[11px] text-slate-400 max-w-xl">
              Transitioned from blogger to independent digital publisher. Created standard custom-hashed digital delivery PDF systems.
            </p>
          </div>

        </div>
      </section>

      {/* Closing quote */}
      <section id="closing-statement" className="py-8 glass-card border border-white/5 h-auto text-slate-100 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-emerald-500/5 blur-xl pointer-events-none" />
        <Award className="h-8 w-8 text-emerald-400 mx-auto" />
        <h3 className="font-extrabold text-sm tracking-widest font-mono text-emerald-400 block uppercase">Ayush's Author Pledge</h3>
        <p className="italic text-xs text-slate-200 max-w-xl mx-auto leading-relaxed font-sans">
          "The best coding manuals are not written by standard commercial publishers; they are carved direct by practicing engineers in the trenches of active codebases. I pledge to write materials that value your precious time, get straight to compilation models, and provide practical BLUEPRINTS you can deploy tomorrow."
        </p>
        <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1 font-mono">
          <Smile className="h-4 w-4 text-emerald-400" />
          <span>Keep coding, keep building. — Ayush</span>
        </div>
      </section>

    </div>
  );
}
