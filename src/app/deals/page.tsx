'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Shield,
  CheckCircle,
  Star,
  Clock,
  ArrowRight,
  BadgeCheck,
  Lock,
  Users,
  Sparkles,
  ExternalLink,
  Eye,
  MousePointer,
} from 'lucide-react';
import Link from 'next/link';

interface Deal {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  discount: string;
  active: boolean;
  impressions?: number;
  clicks?: number;
}

export default function DealsDirectory() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const trackedDeals = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(data => {
        const activeDeals = data.deals?.filter((d: Deal) => d.active) ||
                          (Array.isArray(data) ? data.filter((d: Deal) => d.active) : []);
        setDeals(activeDeals);
        setLoading(false);

        // Track impressions for visible deals
        if (activeDeals.length > 0) {
          const dealIds = activeDeals.map((d: Deal) => d.id);
          trackImpressions(dealIds);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Track impressions (batch)
  const trackImpressions = async (dealIds: string[]) => {
    const untracked = dealIds.filter(id => !trackedDeals.current.has(id));
    if (untracked.length === 0) return;

    untracked.forEach(id => trackedDeals.current.add(id));

    try {
      await fetch('/api/deals/track', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealIds: untracked }),
      });
    } catch (error) {
      console.error('Failed to track impressions:', error);
    }
  };

  // Track individual click
  const trackClick = async (dealId: string) => {
    try {
      await fetch('/api/deals/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, type: 'click' }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handleDealClick = (deal: Deal) => {
    trackClick(deal.id);
    window.open(deal.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf9f6] to-[#f0ede8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e8e5e0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d5a3d] to-[#4a7c4a] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl text-[#2d4a2d]">US Green Deals</span>
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[#3d5a3d] text-white text-sm font-medium hover:bg-[#4a7c4a] transition-colors"
          >
            Get Exclusive Deals
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d5a3d]/5 to-[#4a7c4a]/10" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3d5a3d]/10 text-[#3d5a3d] text-sm font-medium mb-6">
              <BadgeCheck className="w-4 h-4" />
              <span>Verified & Trusted Deals</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d4a2d] mb-6 leading-tight">
              Premium Wellness Deals
              <br />
              <span className="text-[#3d5a3d]">You Can Trust</span>
            </h1>
            <p className="text-lg md:text-xl text-[#4a6a4a] mb-8">
              Every deal is verified by our team. Shop with confidence knowing you&apos;re getting
              authentic products from reputable brands.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <Shield className="w-5 h-5 text-[#3d5a3d]" />
              <span className="text-sm font-medium text-[#2d4a2d]">100% Verified</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <Lock className="w-5 h-5 text-[#3d5a3d]" />
              <span className="text-sm font-medium text-[#2d4a2d]">Secure Shopping</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <Users className="w-5 h-5 text-[#3d5a3d]" />
              <span className="text-sm font-medium text-[#2d4a2d]">50,000+ Members</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-[#2d4a2d]">4.9/5 Rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white border-y border-[#e8e5e0]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-[#2d4a2d] mb-8">How We Verify Deals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#3d5a3d]/10 flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-7 h-7 text-[#3d5a3d]" />
              </div>
              <h3 className="font-semibold text-[#2d4a2d] mb-2">Brand Verification</h3>
              <p className="text-sm text-[#4a6a4a]">
                We verify every brand&apos;s credentials, licenses, and lab testing before featuring their deals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#3d5a3d]/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#3d5a3d]" />
              </div>
              <h3 className="font-semibold text-[#2d4a2d] mb-2">Quality Assurance</h3>
              <p className="text-sm text-[#4a6a4a]">
                Products must meet our strict quality standards and come with third-party lab results.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#3d5a3d]/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-[#3d5a3d]" />
              </div>
              <h3 className="font-semibold text-[#2d4a2d] mb-2">Community Reviews</h3>
              <p className="text-sm text-[#4a6a4a]">
                Real reviews from verified purchasers help you make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Grid - 300x600 Banner Style */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d4a2d]">
              Today&apos;s Verified Deals
            </h2>
            <div className="flex items-center gap-2 text-sm text-[#4a6a4a]">
              <Clock className="w-4 h-4" />
              <span>Updated daily</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl" style={{ aspectRatio: '300/600' }} />
                  <div className="h-10 bg-gray-200 rounded-full mt-4" />
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-[#3d5a3d]/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#2d4a2d] mb-2">New Deals Coming Soon</h3>
              <p className="text-[#4a6a4a] mb-6">
                Sign up to be the first to know when new verified deals are available.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3d5a3d] text-white font-medium hover:bg-[#4a7c4a] transition-colors"
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {deals.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col"
                >
                  {/* 300x600 Banner Image */}
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                    style={{ aspectRatio: '300/600' }}
                    onClick={() => handleDealClick(deal)}
                  >
                    <img
                      src={deal.image_url || '/placeholder-deal.jpg'}
                      alt={deal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">View Deal</span>
                    </div>
                    {/* Discount Badge */}
                    {deal.discount && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-semibold shadow-lg">
                          {deal.discount}
                        </span>
                      </div>
                    )}
                    {/* Verified Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-[#3d5a3d] text-xs font-medium shadow">
                        <BadgeCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Deal Title & CTA Button */}
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-[#2d4a2d] mb-3 line-clamp-2 text-sm md:text-base">
                      {deal.title}
                    </h3>
                    <button
                      onClick={() => handleDealClick(deal)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#3d5a3d] text-white font-medium hover:bg-[#4a7c4a] transition-colors text-sm"
                    >
                      Claim Deal
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-[#2d4a2d] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Thousands Trust US Green Deals
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Verified Vendors Only</h3>
                    <p className="text-white/70 text-sm">
                      Every vendor goes through our rigorous verification process before being featured.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Lab-Tested Products</h3>
                    <p className="text-white/70 text-sm">
                      All products come with third-party lab results for potency and purity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Exclusive Member Savings</h3>
                    <p className="text-white/70 text-sm">
                      Get access to deals you won&apos;t find anywhere else, exclusively for our members.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">21+ Community</h3>
                    <p className="text-white/70 text-sm">
                      A responsible community of adults who appreciate quality wellness products.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Join 50,000+ Members</h3>
                <p className="text-white/70 mb-6">
                  Get exclusive deals delivered to your inbox weekly.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#2d4a2d] font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-xs text-white/50 mt-4">
                  Must be 21+ to subscribe. No spam, ever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2d4a2d] text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How do you verify vendors?',
                a: 'We verify all business licenses, require third-party lab testing results, and conduct background checks on vendors before featuring their deals.',
              },
              {
                q: 'Are these deals legitimate?',
                a: 'Yes! Every deal is personally verified by our team. We only partner with reputable brands that meet our strict quality standards.',
              },
              {
                q: 'Why do I need to be 21+?',
                a: 'Our deals are for adult wellness products. We require age verification to ensure compliance with local regulations.',
              },
              {
                q: 'How often are new deals added?',
                a: 'We add new verified deals weekly. Subscribe to get notified when new deals go live.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#2d4a2d] mb-2">{faq.q}</h3>
                <p className="text-[#4a6a4a] text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2d4a2d] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl">US Green Deals</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/deals" className="hover:text-white transition-colors">Deals</Link>
              <span>Must be 21+</span>
            </div>
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} US Green Deals. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
