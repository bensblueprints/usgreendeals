'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  ArrowRight,
  Shield,
  Package,
  Truck,
  CheckCircle,
  DollarSign,
  Users,
  Zap,
  Award,
  Star,
  MapPin,
  Lock,
  Gift,
  Flame
} from 'lucide-react';

export default function TrustFallPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Why We're Doing This */}
      <WhySection />

      {/* What's In The Box */}
      <ProductSection />

      {/* Affiliate Hustle */}
      <AffiliateSection />

      {/* Brand Authority */}
      <AuthoritySection />

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/30 via-transparent to-purple-900/20" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[10%] right-[20%] w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Pre-headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 text-sm md:text-base font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 rounded-full">
            STOP OVERPAYING AT THE DISPENSARY. THE INTERNET JUST WON.
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          Claim Your Premium 1/8th for Just{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500">
            $10
          </span>
          .
          <br />
          <span className="text-3xl md:text-5xl lg:text-6xl">
            We&apos;ll Throw in a 3-in-1 Infused Preroll & Shipping for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              FREE
            </span>
            .
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
        >
          Yes, we are definitely losing money on this. But that&apos;s how every good relationship starts—with a little bit of trust.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a
            href="#claim"
            className="inline-flex items-center gap-3 px-10 py-5 text-lg md:text-xl font-bold uppercase tracking-wide bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 text-black rounded-full hover:scale-105 transition-transform shadow-2xl shadow-green-500/30 hover:shadow-green-500/50"
          >
            <Gift className="w-6 h-6" />
            CLAIM MY $10 STASH NOW
            <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-wrap justify-center gap-4 md:gap-8"
        >
          {[
            { icon: Shield, label: 'Farm Bill Compliant' },
            { icon: CheckCircle, label: '100% Legal' },
            { icon: Lock, label: 'Secure Checkout' },
            { icon: Truck, label: 'Free Delivery' },
          ].map((badge, i) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 text-gray-400 text-sm md:text-base"
            >
              <badge.icon className="w-5 h-5 text-green-500" />
              <span>{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 1 }, y: { duration: 2, repeat: Infinity } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-green-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-[#0a0a0f] via-[#0f1a0f] to-[#0a0a0f]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Are We Handing You a{' '}
            <span className="text-green-400">$40 1/8th</span> for{' '}
            <span className="text-yellow-400">$10</span>?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Let&apos;s be brutally honest: <strong className="text-white">We are taking a financial hit on your first order.</strong> Between the premium $10 1/8th, the free kief-dusted infused preroll, and the free shipping... the math doesn&apos;t work in our favor today.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              So why do it? Because <strong className="text-green-400">the dispensary system is broken.</strong> You&apos;re overpaying for a middleman.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              We know that once you experience farm-bill compliant, premium cannabis delivered legally to your mailbox, <strong className="text-white">you will never go back to waiting in a dispensary line again.</strong>
            </p>
            <p className="text-2xl font-bold text-green-400 mt-8">
              We&apos;re buying your trust.
            </p>
          </motion.div>

          {/* Right - Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Dispensary Card */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-400">Local Dispensary</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="text-red-500">✕</span>
                  $40-$60 for a 1/8th
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-500">✕</span>
                  Drive there & back
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-500">✕</span>
                  Wait in line
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-500">✕</span>
                  Extra taxes & fees
                </li>
              </ul>
            </div>

            {/* New Harvest Card */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full">
                WINNER
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-400">New Harvest</h3>
              </div>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <strong className="text-white">$10 for a premium 1/8th</strong>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  FREE 3-in-1 Infused Preroll
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  FREE Shipping to your door
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  No lines. No hassle.
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section id="claim" className="relative py-20 md:py-32 px-4 bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 text-sm font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/30 rounded-full mb-6">
            What You&apos;re Getting
          </span>
          <h2 className="text-3xl md:text-5xl font-bold">
            The &quot;Trust Fall&quot;{' '}
            <span className="text-green-400">Starter Kit</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Product 1 - 1/8th */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-b from-green-900/30 to-transparent border border-green-500/20 rounded-3xl p-8 text-center relative overflow-hidden group hover:border-green-500/50 transition-colors"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full">
              $40 VALUE
            </div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Premium 1/8th (3.5g)</h3>
            <p className="text-gray-400">
              Top-shelf, legally compliant, and <strong className="text-green-400">loud</strong>. This isn&apos;t mids—this is what you deserve.
            </p>
          </motion.div>

          {/* Product 2 - Preroll */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-b from-purple-900/30 to-transparent border border-purple-500/20 rounded-3xl p-8 text-center relative overflow-hidden group hover:border-purple-500/50 transition-colors"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
              FREE
            </div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">3-in-1 Infused Preroll</h3>
            <p className="text-gray-400">
              Heavily infused and coated in <strong className="text-purple-400">premium kief</strong>. Because we want to make a lasting impression.
            </p>
          </motion.div>

          {/* Product 3 - Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-b from-blue-900/30 to-transparent border border-blue-500/20 rounded-3xl p-8 text-center relative overflow-hidden group hover:border-blue-500/50 transition-colors"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
              FREE
            </div>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Discreet, Free Shipping</h3>
            <p className="text-gray-400">
              Straight to your door. <strong className="text-blue-400">No dispensary lines. No hassle.</strong> Just quality delivered.
            </p>
          </motion.div>
        </div>

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a
            href="#order"
            className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold uppercase tracking-wide bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 text-black rounded-full hover:scale-105 transition-transform shadow-2xl shadow-green-500/30"
          >
            SEND ME MY KIT
            <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function AffiliateSection() {
  return (
    <section className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 text-sm font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-6">
            The Hustle
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Get High on Your Own Supply.{' '}
            <span className="text-yellow-400">Then Get Paid for It.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Online cannabis is a <strong className="text-white">booming billion-dollar market</strong>. You can either just be a consumer, or you can take a cut.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              We&apos;ve already empowered over <strong className="text-yellow-400">2,000+ everyday Americans</strong> to become digital dispensaries.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              When you join New Harvest, you don&apos;t just get cheap autoship weed. You get a <strong className="text-white">unique invite link</strong>. Share it with your friends, and we will pay you up to <strong className="text-green-400">20% commission</strong> on their orders. <span className="text-yellow-400 font-bold">FOR LIFE.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {[
              { icon: Package, title: 'Zero Inventory', desc: 'We handle all the product & shipping' },
              { icon: Shield, title: 'Zero Risk', desc: 'No upfront costs or commitments' },
              { icon: DollarSign, title: 'Lifetime Commissions', desc: 'Earn 20% on every order, forever' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
              <p className="text-lg font-bold text-yellow-400">
                Just share your link and get paid when your friends ditch the dispensary.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AuthoritySection() {
  const testimonials = [
    {
      name: 'Jake M.',
      location: 'Austin, TX',
      quote: 'I was skeptical about the $10 deal but the quality is insane. Already on my 4th autoship order.',
      rating: 5,
    },
    {
      name: 'Sarah K.',
      location: 'Denver, CO',
      quote: 'Made $800 last month just sharing my link with friends. This is legit.',
      rating: 5,
    },
    {
      name: 'Marcus T.',
      location: 'Miami, FL',
      quote: 'Finally, premium flower without the dispensary tax. Never going back.',
      rating: 5,
    },
  ];

  return (
    <section className="relative py-20 md:py-32 px-4 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
            The Rebellion
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Born in Texas.{' '}
            <span className="text-green-400">Fighting for Your Freedom.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-green-900/20 via-transparent to-green-900/20 border border-green-500/20 rounded-3xl p-8 md:p-12 mb-16"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-12 h-12 text-green-400" />
            </div>
            <div>
              <p className="text-lg text-gray-300 leading-relaxed">
                We aren&apos;t just selling online. We are actively throwing <strong className="text-white">live cannabis events right in the heart of Texas</strong>, and we are heavily lobbying to protect and expand your cannabis freedom through the Farm Bill.
              </p>
              <p className="text-xl font-bold text-green-400 mt-4">
                When you buy from New Harvest, you are funding the fight for legalization.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section id="order" className="relative py-20 md:py-32 px-4 bg-gradient-to-b from-[#0a0a0f] to-[#0f1a0f]">
      {/* Glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-green-500/20 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Are You Putting Your Stash on Autoship, or Are You Still Getting{' '}
            <span className="text-red-400">Fleeced</span> at the Dispensary?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            The legal online weed boom is here. Grab your $10 1/8th and free preroll before we come to our senses.
          </p>

          <a
            href="https://newharvestcannabis.com/trust-fall"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-12 py-6 text-xl font-bold uppercase tracking-wide bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 text-black rounded-full hover:scale-105 transition-transform shadow-2xl shadow-green-500/40 hover:shadow-green-500/60"
          >
            <Zap className="w-7 h-7" />
            I WANT MY $10 1/8TH + FREE PREROLL
            <ArrowRight className="w-7 h-7" />
          </a>

          {/* Urgency */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-gray-500"
          >
            Limited time offer. First-time customers only.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#050508] border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">New Harvest</span>
        </div>

        {/* Age verification */}
        <div className="flex items-center justify-center gap-2 mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md mx-auto">
          <Shield className="w-5 h-5 text-red-400" />
          <span className="text-sm text-gray-300">
            <strong className="text-white">Must be 21+</strong> to purchase. By proceeding, you confirm you are of legal age.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-8">
          <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          <a href="#" className="hover:text-white transition-colors">Contact Us</a>
        </div>

        {/* Legal */}
        <p className="text-center text-xs text-gray-600 max-w-2xl mx-auto">
          New Harvest products are derived from hemp and contain less than 0.3% Delta-9 THC in compliance with the 2018 Farm Bill. These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
        </p>

        {/* Copyright */}
        <p className="text-center text-sm text-gray-500 mt-8">
          &copy; {new Date().getFullYear()} New Harvest. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
