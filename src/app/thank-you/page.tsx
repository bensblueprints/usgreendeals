'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, CheckCircle, MapPin, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      action: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

interface LocationData {
  city: string;
  state: string;
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const zipCode = searchParams.get('zip');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const hasTracked = useRef(false);

  // Track signup conversion in Google Analytics (only once)
  useEffect(() => {
    if (!hasTracked.current && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        event_category: 'conversion',
        event_label: 'email_signup',
        zip_code: zipCode || 'unknown',
      });
      hasTracked.current = true;
    }
  }, [zipCode]);

  useEffect(() => {
    if (zipCode) {
      fetchLocation(zipCode);
    } else {
      setLoading(false);
    }
  }, [zipCode]);

  const fetchLocation = async (zip: string) => {
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (response.ok) {
        const data = await response.json();
        if (data.places && data.places.length > 0) {
          setLocation({
            city: data.places[0]['place name'],
            state: data.places[0]['state'],
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh botanical-pattern relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[10%] w-72 h-72 bg-[var(--sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-[40%] right-[5%] w-96 h-96 bg-[var(--accent-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-200" />
        <div className="absolute bottom-[10%] left-[30%] w-80 h-80 bg-[var(--primary-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-400" />
      </div>

      <div className="relative z-10 min-h-screen px-4 py-12 flex flex-col items-center justify-center">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-3 mb-12 absolute top-8 left-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--moss)] flex items-center justify-center shadow-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-[var(--forest)]">
            US Green Deals
          </span>
        </Link>

        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          <div className="glass rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[var(--sage-light)] to-transparent opacity-50 rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[var(--accent-light)] to-transparent opacity-30 rounded-tl-full" />

            <div className="relative">
              {/* Success icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--moss)] flex items-center justify-center shadow-xl"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              {/* Success message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="font-display text-4xl md:text-5xl text-[var(--forest)] mb-4">
                  You're In!
                </h1>

                {loading ? (
                  <div className="py-6">
                    <div className="w-8 h-8 border-3 border-[var(--sage)] border-t-[var(--primary)] rounded-full animate-spin mx-auto" />
                  </div>
                ) : location ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="my-8"
                  >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--sage-light)]/50 border border-[var(--sage)]/30 mb-4">
                      <MapPin className="w-5 h-5 text-[var(--primary)]" />
                      <span className="text-lg font-medium text-[var(--forest)]">
                        {location.city}, {location.state}
                      </span>
                    </div>
                    <p className="text-xl text-[var(--forest)]/80 leading-relaxed">
                      Great news! We have exclusive deals
                      <br />
                      available in your area.
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-xl text-[var(--forest)]/80 mb-6">
                    Great news! You're now on the list for exclusive deals.
                  </p>
                )}
              </motion.div>

              {/* Email reminder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-6 rounded-2xl bg-[var(--cream)] border border-[var(--sage)]/20"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Mail className="w-6 h-6 text-[var(--primary)]" />
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h3 className="font-display text-xl text-[var(--forest)] mb-2">
                  Check Your Inbox!
                </h3>
                <p className="text-[var(--forest)]/70">
                  We've sent your <strong>first exclusive deal</strong> to your email.
                  <br />
                  Don't forget to check your spam folder!
                </p>
              </motion.div>

              {/* What to expect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 pt-6 border-t border-[var(--sage)]/20"
              >
                <p className="text-sm text-[var(--forest)]/60 mb-4">What to expect:</p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[var(--forest)]/70">
                    <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                    <span>Weekly deals</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--forest)]/70">
                    <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                    <span>Local offers</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--forest)]/70">
                    <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
                    <span>Members-only savings</span>
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

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="w-10 h-10 border-3 border-[var(--sage)] border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
