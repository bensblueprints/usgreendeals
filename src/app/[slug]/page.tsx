'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, CheckCircle, ArrowRight, Sparkles, Shield, MapPin } from 'lucide-react';

// Declare gtag and fbq for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      action: string | Date,
      params?: Record<string, unknown>
    ) => void;
    fbq?: (
      command: 'track' | 'init' | 'trackCustom',
      event: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

interface Client {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  fb_pixel_id: string | null;
}

interface ThankYouPageRef {
  id: string;
  slug: string;
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
  client_id: string | null;
  klaviyo_list_id: string | null;
  show_logo: boolean;
  logo_url: string | null;
  thank_you_page_id: string | null;
  client?: Client | null;
  thank_you_page?: ThankYouPageRef | null;
}

interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

export default function SlugLandingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [utmData, setUtmData] = useState<UTMData>({});

  useEffect(() => {
    setMounted(true);
    // Capture UTM params from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setUtmData({
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        referrer: document.referrer || undefined,
      });
    }
    if (slug) {
      fetch(`/api/landing-pages?action=by-slug&slug=${encodeURIComponent(slug)}`)
        .then(res => res.json())
        .then(data => {
          if (data.page) {
            setLandingPage(data.page);
            // Track page view
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'page_view', {
                page_title: data.page.name,
                landing_page_id: data.page.id,
                landing_page_slug: data.page.slug,
                landing_page_theme: data.page.theme,
              });
            }
            // Initialize Facebook Pixel if client has one configured
            const pixelId = data.page.client?.fb_pixel_id;
            if (pixelId && typeof window !== 'undefined') {
              // Load Facebook Pixel script dynamically
              if (!document.getElementById('fb-pixel-script')) {
                const script = document.createElement('script');
                script.id = 'fb-pixel-script';
                script.innerHTML = `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${pixelId}');
                  fbq('track', 'PageView');
                `;
                document.head.appendChild(script);
                // Add noscript fallback
                const noscript = document.createElement('noscript');
                noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
                document.body.appendChild(noscript);
              }
            }
            // Increment views
            fetch(`/api/landing-pages?action=increment-views&id=${data.page.id}`, { method: 'POST' });
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

      // Track form submission
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'engagement',
          event_label: landingPage?.name || 'default',
          landing_page_id: landingPage?.id,
          landing_page_slug: landingPage?.slug,
        });
      }

      // Track Facebook Pixel Lead event
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: landingPage?.name || 'Landing Page',
          content_category: landingPage?.slug || 'lead',
        });
      }

      // Redirect to custom thank you page if set, otherwise default
      const params = new URLSearchParams({
        zip: zipCode,
        ...(data.subscriberId && { sid: data.subscriberId }),
        ...(data.landingPageId && { lpid: data.landingPageId }),
      });

      if (landingPage?.thank_you_page?.slug) {
        window.location.href = `/thank-you/${landingPage.thank_you_page.slug}?${params.toString()}`;
      } else {
        window.location.href = `/thank-you?${params.toString()}`;
      }
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

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="text-center">
          <Leaf className="w-16 h-16 text-[#3d5a3d] mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-[#2d4a2d] mb-2">Page Not Found</h1>
          <p className="text-[#2d4a2d]/60 mb-6">This landing page doesn't exist.</p>
          <a href="/" className="text-[#3d5a3d] underline">Go to homepage</a>
        </div>
      </div>
    );
  }

  const isDark = landingPage?.theme === 'dark';

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
      showLogo={landingPage?.show_logo || false}
      clientLogo={landingPage?.logo_url || null}
      clientName={landingPage?.name || null}
    />;
  }

  // Light theme
  return (
    <div className="min-h-screen gradient-mesh botanical-pattern relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-[var(--sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-[var(--accent-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-200" />
        <div className="absolute bottom-[20%] left-[20%] w-80 h-80 bg-[var(--primary-light)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob delay-400" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {landingPage?.show_logo && landingPage?.logo_url ? (
            <img
              src={landingPage.logo_url}
              alt={landingPage.name || 'Logo'}
              className="h-16 md:h-20 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--moss)] flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-2xl md:text-3xl font-semibold text-[var(--forest)]">
                US Green Deals
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[var(--sage-light)] to-transparent opacity-50 rounded-br-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[var(--accent-light)] to-transparent opacity-30 rounded-tl-full" />

            <div className="relative">
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

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl text-center text-[var(--forest)] mb-4 leading-tight"
              >
                {landingPage?.headline || 'Exclusive Green Lifestyle Deals'}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-[var(--forest)]/70 mb-6 text-lg"
              >
                {landingPage?.subheadline || 'Join our exclusive list for premium wellness deals.'}
              </motion.p>

              {/* Inline Video Player */}
              {landingPage?.video_url && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="mb-6 rounded-2xl overflow-hidden shadow-lg"
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-auto"
                  >
                    <source src={landingPage.video_url} type="video/mp4" />
                  </video>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-[var(--cream)] border border-[var(--sage)]/20"
              >
                <Shield className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--forest)]/80">
                  You must be <strong>21 or older</strong> to subscribe
                </span>
              </motion.div>

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

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-sm text-[var(--forest)]/50"
        >
          <p>&copy; {new Date().getFullYear()} US Green Deals. All rights reserved.</p>
        </motion.footer>
      </div>

      {landingPage?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: landingPage.custom_css }} />
      )}
    </div>
  );
}

// Dark theme component
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
  showLogo,
  clientLogo,
  clientName,
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
  showLogo: boolean;
  clientLogo: string | null;
  clientName: string | null;
}) {
  const bgImage = landingPage?.background_image || '/gorilla-bg.png';
  const videoUrl = landingPage?.video_url;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: landingPage?.background_color || '#1a1a2e',
      }}
    >
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {showLogo && clientLogo ? (
            <img
              src={clientLogo}
              alt={clientName || 'Logo'}
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <div className="backdrop-blur-xl bg-black/40 rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-green-400/20 to-purple-500/20 opacity-50" />

            <div className="relative">
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

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-display text-3xl md:text-4xl lg:text-5xl text-center text-white mb-4 leading-tight"
              >
                {landingPage?.headline || 'Join the Movement'}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-gray-300 mb-6 text-lg"
              >
                {landingPage?.subheadline || 'Premium deals for the elevated lifestyle.'}
              </motion.p>

              {/* Inline Video Player */}
              {videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-white/20"
                >
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-auto"
                  >
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">
                  You must be <strong className="text-white">21 or older</strong> to subscribe
                </span>
              </motion.div>

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

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-sm text-gray-400"
        >
          <p>&copy; {new Date().getFullYear()} US Green Deals. All rights reserved.</p>
        </motion.footer>
      </div>

      {landingPage?.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: landingPage.custom_css }} />
      )}
    </div>
  );
}
