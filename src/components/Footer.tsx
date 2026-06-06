/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext.js';
import { BookOpen, ShieldCheck, Mail, Globe, Sparkles, Copyright } from 'lucide-react';

export default function Footer() {
  const { setView } = useApp();

  return (
    <footer id="app-global-footer" className="bg-[#0b1329]/40 backdrop-blur-md border-t border-white/5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Main info branding */}
          <div className="space-y-4 col-span-1 md:col-span-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-sans font-bold tracking-tight text-slate-100 uppercase text-sm">
                Ayush Digital Library
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Founded by author and developer Ayush. Providing highly detailed technical textbooks, digital coding guides, and self-improvement assets direct to engineers worldwide since 2024.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Encrypted Downloads & Secure Gateway Checked
            </div>
          </div>

          {/* Quick links columns */}
          <div>
            <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold mb-3">
              Library Store
            </h4>
            <div className="flex flex-col space-y-2 text-xs">
              <button onClick={() => setView('shop')} className="text-left text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                Browse eBooks
              </button>
              <button onClick={() => setView('reviews')} className="text-left text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                Public Reader Reviews
              </button>
              <button onClick={() => setView('about-author')} className="text-left text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                About the Author
              </button>
              <button onClick={() => setView('contact')} className="text-left text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                Bulk Corporate Requests
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold mb-3">
              Security & Legal
            </h4>
            <div className="flex flex-col space-y-2 text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                🛡️ Copy-Protected Downloads
              </span>
              <span className="text-slate-300 flex items-center gap-1">
                🔒 SSL Encrypted Checkout
              </span>
              <span className="text-slate-300 flex items-center gap-1">
                💳 Stripe & UPI Compliant
              </span>
              <span className="text-slate-300 flex items-center gap-1">
                📧 Automated Receipts
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-bold mb-3">
              Author Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-mono">
                <Mail className="h-3 w-3 text-emerald-400" />
                <span>ayush@digitallibrary.com</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <Globe className="h-3 w-3 text-emerald-400" />
                <span>ayushcodes.dev</span>
              </div>
              <div className="pt-2 flex items-center gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wide">
                  New Releases Weekly
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 font-sans gap-2">
          <div className="flex items-center gap-1">
            <Copyright className="h-3.5 w-3.5 text-emerald-400" />
            <span>2026 Ayush Digital Library. All copyrights reserved under international DMCA digital download protection.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('admin-login')} className="hover:text-emerald-400 transition-colors">
              Owner Panel
            </button>
            <span className="text-white/10">|</span>
            <span>Version 2.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
