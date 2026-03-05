'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, CheckCircle, MapPin, Mail, Sparkles, ExternalLink } from 'lucide-react';
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

interface ThankYouPage {
  id: string;
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  body_text: string | null;
  background_image: string | null;
  background_color: string;
  video_url: string | null;
  theme: 'light' | 'dark';
  custom_css: string | null;
  show_logo: boolean;
  cta_text: string | null;
  cta_url: string | null;
  cta_style: string;
  clients?: {
    name: string;
    logo_url: string | null;
    slug: string;
  } | null;
}

interface LocationData {
  city: string;
  state: string;
}

function ThankYouContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const zipCode = searchParams.get('zip');
  const subscriberId = searchParams.get('sid');
  const landingPageId = searchParams.get('lpid');

  const [thankYouPage, setThankYouPage] = useState<ThankYouPage | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const hasTracked = useRef(false);
  const hasSynced = useRef(false);

  // Track signup conversion in Google Analytics (only once)
  useEffect(() => {
    if (!hasTracked.current && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        event_category: 'conversion',
        event_label: 'email_signup',
        zip_code: zipCode || 'unknown',
        thank_you_page: slug,
      });
      hasTracked.current = true;
    }
  }, [zipCode, slug]);

  // Trigger Klaviyo sync after 20 seconds
  useEffect(() => {
    if (!hasSynced.current && subscriberId && landingPageId) {
      const syncTimer = setTimeout(async () => {
        if (hasSynced.current) return;
        hasSynced.current = true;

        try {
          console.log('Triggering delayed Klaviyo sync...');
          const response = await fetch('/api/klaviyo/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscriberId, landingPageId }),
          });

          const data = await response.json();
          if (response.ok) {
            console.log('Klaviyo sync successful:', data);
          } else {
            console.error('Klaviyo sync failed:', data);
          }
        } catch (error) {
          console.error('Klaviyo sync error:', error);
        }
      }, 20000);

      return () => clearTimeout(syncTimer);
    }
  }, [subscriberId, landingPageId]);

  // Fetch thank you page data
  useEffect(() => {
    if (slug) {
      fetch(`/api/thank-you-pages?slug=${encodeURIComponent(slug)}`)
        .then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(data => {
          if (data && data.id) {
            setThankYouPage(data);
          } else {
            setNotFound(true);
          }
          setPageLoading(false);
        })
        .catch(() => {
          setNotFound(true);
          setPageLoading(false);
        });
    }
  }, [slug]);

  // Fetch location from zip code
  useEffect(() => {
    if (zipCode) {
      fetch(`https://api.zippopotam.us/us/${zipCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.places && data.places.length > 0) {
            setLocation({
              city: data.places[0]['place name'],
              state: data.places[0]['state'],
            });
          }
        })
        .catch(console.error)
        .finally(() => setLocationLoading(false));
    } else {
      setLocationLoading(false);
    }
  }, [zipCode]);

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="w-10 h-10 border-3 border-gray-600 border-t-green-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-center text-white">
          <Leaf className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
          <p className="text-gray-400 mb-6">This thank you page doesn't exist.</p>
          <Link href="/" className="text-green-400 underline">Go to homepage</Link>
        </div>
      </div>
    );
  }

  const isDark = thankYouPage?.theme === 'dark';
  const bgColor = thankYouPage?.background_color || '#1a1a2e';
  const videoUrl = thankYouPage?.video_url;
  const bgImage = thankYouPage?.background_image;

  if (isDark) {
    return (
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          backgroundImage: videoUrl ? 'none' : bgImage ? `url(${bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: bgColor,
        }}
      >
        {videoUrl && (
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-green-400 rounded-full mix-blend-overlay filter blur-3xl"
          />
        </div>

        <div className="relative z-10 min-h-screen px-4 py-12 flex flex-col items-center justify-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {thankYouPage?.show_logo && thankYouPage?.clients?.logo_url ? (
              <img
                src={thankYouPage.clients.logo_url}
                alt={thankYouPage.clients.name || 'Logo'}
                className="h-16 md:h-20 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <span className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                  US Green Deals
                </span>
              </div>
            )}
          </motion.div>

          {/* Success card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl"
          >
            <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-10 md:p-14 shadow-2xl border border-white/10 relative overflow-hidden text-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-green-400/20 to-purple-500/20 opacity-50" />

              <div className="relative">
                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-purple-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-4xl md:text-5xl text-white mb-4"
                >
                  {thankYouPage?.headline || "You're In!"}
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-300 mb-6"
                >
                  {thankYouPage?.subheadline || "Your submission has been received."}
                </motion.p>

                {/* Location */}
                {location && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="my-6"
                  >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 mb-4">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span className="text-lg font-medium text-white">
                        {location.city}, {location.state}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Body text */}
                {thankYouPage?.body_text && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-300 mb-8 whitespace-pre-wrap"
                  >
                    {thankYouPage.body_text}
                  </motion.div>
                )}

                {/* CTA Button */}
                {thankYouPage?.cta_text && thankYouPage?.cta_url && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8"
                  >
                    <a
                      href={thankYouPage.cta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black shadow-lg shadow-green-500/30 transition-all hover:shadow-green-400/40 hover:scale-[1.02]"
                    >
                      <span>{thankYouPage.cta_text}</span>
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </motion.div>
                )}

                {/* Email reminder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Mail className="w-6 h-6 text-green-400" />
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-display text-xl text-white mb-2">
                    Check Your Inbox!
                  </h3>
                  <p className="text-gray-400">
                    We've sent your <strong className="text-white">first exclusive deal</strong> to your email.
                    <br />
                    Don't forget to check your spam folder!
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-center text-sm text-gray-500"
          >
            <p>&copy; {new Date().getFullYear()} US Green Deals. All rights reserved.</p>
          </motion.footer>
        </div>

        {thankYouPage?.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: thankYouPage.custom_css }} />
        )}
      </div>
    );
  }

  // Light theme
  return (
    <div className="min-h-screen gradient-mesh botanical-pattern relative">
      {videoUrl && (
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[var(--background)]/80" />
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[10%] w-72 h-72 bg-[var(--sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-[40%] right-[5%] w-96 h-96 bg-[var(--accent-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-200" />
        <div className="absolute bottom-[10%] left-[30%] w-80 h-80 bg-[var(--primary-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-400" />
      </div>

      <div className="relative z-10 min-h-screen px-4 py-12 flex flex-col items-center justify-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {thankYouPage?.show_logo && thankYouPage?.clients?.logo_url ? (
            <img
              src={thankYouPage.clients.logo_url}
              alt={thankYouPage.clients.name || 'Logo'}
              className="h-16 md:h-20 w-auto object-contain"
            />
          ) : (
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--moss)] flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-[var(--forest)]">
                US Green Deals
              </span>
            </Link>
          )}
        </motion.div>

        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          <div className="glass rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden text-center">
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

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-5xl text-[var(--forest)] mb-4"
              >
                {thankYouPage?.headline || "You're In!"}
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-[var(--forest)]/80 mb-6"
              >
                {thankYouPage?.subheadline || "Your submission has been received."}
              </motion.p>

              {/* Location */}
              {location && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="my-6"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--sage-light)]/50 border border-[var(--sage)]/30 mb-4">
                    <MapPin className="w-5 h-5 text-[var(--primary)]" />
                    <span className="text-lg font-medium text-[var(--forest)]">
                      {location.city}, {location.state}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Body text */}
              {thankYouPage?.body_text && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-[var(--forest)]/70 mb-8 whitespace-pre-wrap"
                >
                  {thankYouPage.body_text}
                </motion.div>
              )}

              {/* CTA Button */}
              {thankYouPage?.cta_text && thankYouPage?.cta_url && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8"
                >
                  <a
                    href={thankYouPage.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-primary py-4 px-8 rounded-2xl text-white font-semibold text-lg"
                  >
                    <span>{thankYouPage.cta_text}</span>
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </motion.div>
              )}

              {/* Email reminder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
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
                transition={{ delay: 0.9 }}
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

      {thankYouPage?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: thankYouPage.custom_css }} />
      )}
    </div>
  );
}

export default function DynamicThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="w-10 h-10 border-3 border-gray-600 border-t-green-400 rounded-full animate-spin" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
