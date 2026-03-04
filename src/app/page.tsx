'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, CheckCircle, ArrowRight, Sparkles, Shield, MapPin } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!zipCode || zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, zipCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to thank you page with zip code
      window.location.href = `/thank-you?zip=${zipCode}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen gradient-mesh botanical-pattern relative overflow-hidden">
      {/* Floating organic shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-[var(--sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-[var(--accent-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-200" />
        <div className="absolute bottom-[20%] left-[20%] w-80 h-80 bg-[var(--primary-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-400" />

        {/* Floating leaf shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[20%] text-[var(--sage)] opacity-30"
        >
          <svg width="80" height="120" viewBox="0 0 80 120" fill="currentColor">
            <path d="M40 0 C60 30 70 60 70 90 C70 110 55 120 40 120 C25 120 10 110 10 90 C10 60 20 30 40 0 Z" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[30%] left-[8%] text-[var(--primary-light)] opacity-25"
        >
          <svg width="60" height="90" viewBox="0 0 80 120" fill="currentColor">
            <path d="M40 0 C60 30 70 60 70 90 C70 110 55 120 40 120 C25 120 10 110 10 90 C10 60 20 30 40 0 Z" />
          </svg>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--moss)] flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl md:text-3xl font-semibold text-[var(--forest)]">
              US Green Deals
            </span>
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[var(--sage-light)] to-transparent opacity-50 rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[var(--accent-light)] to-transparent opacity-30 rounded-tl-full" />

            <div className="relative">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sage-light)]/40 border border-[var(--sage)]/30">
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm font-medium text-[var(--primary)]">Members Only Savings</span>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl text-center text-[var(--forest)] mb-4 leading-tight"
              >
                Exclusive Green
                <br />
                <span className="text-[var(--primary)]">Lifestyle Deals</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-[var(--forest)]/70 mb-8 text-lg"
              >
                Join our exclusive list for premium wellness deals.
                <br className="hidden md:block" />
                Curated savings on natural products you'll love.
              </motion.p>

              {/* Age verification notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-[var(--cream)] border border-[var(--sage)]/20"
              >
                <Shield className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--forest)]/80">
                  You must be <strong>21 or older</strong> to subscribe
                </span>
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sage)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 border-2 border-[var(--sage)]/30 text-[var(--forest)] placeholder:text-[var(--forest)]/40 focus:border-[var(--primary)] transition-colors text-lg"
                    disabled={isLoading}
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sage)]" />
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Your zip code"
                    maxLength={5}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 border-2 border-[var(--sage)]/30 text-[var(--forest)] placeholder:text-[var(--forest)]/40 focus:border-[var(--primary)] transition-colors text-lg"
                    disabled={isLoading}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Get Exclusive Deals</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.form>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-8 pt-6 border-t border-[var(--sage)]/20"
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--forest)]/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                    <span>No spam, ever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                    <span>Unsubscribe anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                    <span>Local deals</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-sm text-[var(--forest)]/50"
        >
          <p>&copy; {new Date().getFullYear()} US Green Deals. All rights reserved.</p>
          <p className="mt-1">Premium wellness deals for the mindful lifestyle.</p>
        </motion.footer>
      </div>
    </div>
  );
}
