'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, CheckCircle, ArrowRight, Sparkles, Shield, MapPin, Volume2, VolumeX } from 'lucide-react';

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

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  background_image: string | null;
  background_color: string;
  video_url: string | null;
  headline: string;
  subheadline: string;
  button_text: string;
  theme: 'light' | 'dark';
  custom_css: string | null;
  collect_first_name: boolean;
}

interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [utmData, setUtmData] = useState<UTMData>({});

  // Video sound toggle state
  const lightVideoRef = useRef<HTMLVideoElement>(null);
  const [lightVideoMuted, setLightVideoMuted] = useState(true);

  const toggleLightVideoSound = () => {
    if (lightVideoRef.current) {
      lightVideoRef.current.muted = !lightVideoRef.current.muted;
      setLightVideoMuted(lightVideoRef.current.muted);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Capture UTM params from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUtmData({
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
        utm_term: params.get('utm_term') || undefined,
        utm_content: params.get('utm_content') || undefined,
        referrer: document.referrer || undefined,
      });
    }
    // First check if there's a homepage set, otherwise use random A/B testing
    fetch('/api/landing-pages?action=homepage')
      .then(res => res.json())
      .then(data => {
        if (data.page) {
          // Homepage is set, use it directly
          setLandingPage(data.page);
          setPageLoading(false);
          // Track landing page view with variant info
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_view', {
              page_title: data.page.name,
              landing_page_id: data.page.id,
              landing_page_slug: data.page.slug,
              landing_page_theme: data.page.theme,
              is_homepage: true,
            });
          }
        } else {
          // No homepage, use random landing page for A/B test
          return fetch('/api/landing-pages?action=random')
            .then(res => res.json())
            .then(data => {
              if (data.page) {
                setLandingPage(data.page);
                // Track landing page view with variant info
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'page_view', {
                    page_title: data.page.name,
                    landing_page_id: data.page.id,
                    landing_page_slug: data.page.slug,
                    landing_page_theme: data.page.theme,
                    is_homepage: false,
                  });
                }
              }
              setPageLoading(false);
            });
        }
      })
      .catch(() => {
        setPageLoading(false);
      });
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
        body: JSON.stringify({
          email,
          firstName: landingPage?.collect_first_name ? firstName : '',
          zipCode,
          landingPageId: landingPage?.id,
          ...utmData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Track form submission in Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'engagement',
          event_label: landingPage?.name || 'default',
          landing_page_id: landingPage?.id,
          landing_page_slug: landingPage?.slug,
        });
      }

      // Redirect with subscriber ID and landing page ID for delayed Klaviyo sync
      const params = new URLSearchParams({
        zip: zipCode,
        ...(data.subscriberId && { sid: data.subscriberId }),
        ...(data.landingPageId && { lpid: data.landingPageId }),
      });
      window.location.href = `/thank-you?${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      setIsLoading(false);
    }
  };

  if (!mounted || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="w-8 h-8 border-4 border-[#3d5a3d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Dark theme for psychedelic variant
  const isDark = landingPage?.theme === 'dark';
  const hasCustomBg = landingPage?.background_image;

  if (isDark) {
    return <DarkThemePage
      landingPage={landingPage}
      email={email}
      setEmail={setEmail}
      firstName={firstName}
      setFirstName={setFirstName}
      zipCode={zipCode}
      setZipCode={setZipCode}
      isLoading={isLoading}
      error={error}
      handleSubmit={handleSubmit}
    />;
  }

  // Original light theme
  const lightVideoUrl = landingPage?.video_url;

  return (
    <div className="min-h-screen gradient-mesh botanical-pattern relative overflow-hidden">
      {/* Video Background for Light Theme */}
      {lightVideoUrl && (
        <div className="absolute inset-0 z-0">
          <video
            ref={lightVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={lightVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[var(--background)]/80" />
          {/* Sound Toggle Button */}
          <button
            onClick={toggleLightVideoSound}
            className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-105"
            aria-label={lightVideoMuted ? 'Unmute video' : 'Mute video'}
          >
            {lightVideoMuted ? (
              <VolumeX className="w-6 h-6 text-[var(--forest)]" />
            ) : (
              <Volume2 className="w-6 h-6 text-[var(--forest)]" />
            )}
          </button>
        </div>
      )}
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
                {landingPage?.headline?.split(' ').slice(0, 2).join(' ') || 'Exclusive Green'}
                <br />
                <span className="text-[var(--primary)]">
                  {landingPage?.headline?.split(' ').slice(2).join(' ') || 'Lifestyle Deals'}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-[var(--forest)]/70 mb-8 text-lg"
              >
                {landingPage?.subheadline || 'Join our exclusive list for premium wellness deals.'}
                <br className="hidden md:block" />
                Curated savings on natural products you&apos;ll love.
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
                {landingPage?.collect_first_name && (
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sage)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Your first name"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 border-2 border-[var(--sage)]/30 text-[var(--forest)] placeholder:text-[var(--forest)]/40 focus:border-[var(--primary)] transition-colors text-lg"
                      disabled={isLoading}
                    />
                  </div>
                )}

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
                      <span>{landingPage?.button_text || 'Get Exclusive Deals'}</span>
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

// Dark theme psychedelic variant
function DarkThemePage({
  landingPage,
  email,
  setEmail,
  firstName,
  setFirstName,
  zipCode,
  setZipCode,
  isLoading,
  error,
  handleSubmit,
}: {
  landingPage: LandingPage | null;
  email: string;
  setEmail: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  zipCode: string;
  setZipCode: (v: string) => void;
  isLoading: boolean;
  error: string;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  const bgImage = landingPage?.background_image || '/gorilla-bg.png';
  const videoUrl = landingPage?.video_url;
  const darkVideoRef = useRef<HTMLVideoElement>(null);
  const [darkVideoMuted, setDarkVideoMuted] = useState(true);

  const toggleDarkVideoSound = () => {
    if (darkVideoRef.current) {
      darkVideoRef.current.muted = !darkVideoRef.current.muted;
      setDarkVideoMuted(darkVideoRef.current.muted);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: videoUrl ? 'none' : `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: landingPage?.background_color || '#1a1a2e',
      }}
    >
      {/* Video Background */}
      {videoUrl && (
        <div className="absolute inset-0 z-0">
          <video
            ref={darkVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {/* Sound Toggle Button */}
          <button
            onClick={toggleDarkVideoSound}
            className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 shadow-lg transition-all hover:scale-105"
            aria-label={darkVideoMuted ? 'Unmute video' : 'Mute video'}
          >
            {darkVideoMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-green-400" />
            )}
          </button>
        </div>
      )}
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Animated glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-green-400 rounded-full mix-blend-overlay filter blur-3xl"
        />
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
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
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
          <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-green-400/20 to-purple-500/20 opacity-50" />

            <div className="relative">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/30 to-green-400/30 border border-purple-400/30">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Elevated Savings</span>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl text-center text-white mb-4 leading-tight"
              >
                {landingPage?.headline || 'Join the Movement'}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-gray-300 mb-8 text-lg"
              >
                {landingPage?.subheadline || 'Premium deals for the elevated lifestyle.'}
                <br className="hidden md:block" />
                Be first to know.
              </motion.p>

              {/* Age verification notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">
                  You must be <strong className="text-white">21 or older</strong> to subscribe
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
                {landingPage?.collect_first_name && (
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Your first name"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:bg-white/15 transition-all text-lg backdrop-blur-sm"
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:bg-white/15 transition-all text-lg backdrop-blur-sm"
                    disabled={isLoading}
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Your zip code"
                    maxLength={5}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:bg-white/15 transition-all text-lg backdrop-blur-sm"
                    disabled={isLoading}
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-black shadow-lg shadow-green-500/30 transition-all hover:shadow-green-400/40 hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{landingPage?.button_text || 'Get Exclusive Deals'}</span>
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
                className="mt-8 pt-6 border-t border-white/10"
              >
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>No spam, ever</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Unsubscribe anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
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
          className="mt-12 text-center text-sm text-gray-400"
        >
          <p>&copy; {new Date().getFullYear()} US Green Deals. All rights reserved.</p>
          <p className="mt-1">Premium wellness deals for the elevated lifestyle.</p>
        </motion.footer>
      </div>

      {/* Inject custom CSS if provided */}
      {landingPage?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: landingPage.custom_css }} />
      )}
    </div>
  );
}
