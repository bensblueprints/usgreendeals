'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, AlertTriangle, CheckCircle, XCircle, HelpCircle, MapPin, List, ArrowRight } from 'lucide-react';
import USMap from '@/components/USMap';
import { StateData, stateData, statusLabels, statusColors, LegalStatus } from '@/data/thca-legality';
import Link from 'next/link';

export default function LegalityPage() {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const handleStateHover = (state: StateData | null) => {
    setSelectedState(state);
  };

  const handleStateClick = (state: StateData) => {
    setSelectedState(state);
  };

  // Group states by status
  const statesByStatus = Object.values(stateData).reduce((acc, state) => {
    if (!acc[state.status]) {
      acc[state.status] = [];
    }
    acc[state.status].push(state);
    return acc;
  }, {} as Record<LegalStatus, StateData[]>);

  // Count stats
  const statusCounts = {
    legal: statesByStatus['legal']?.length || 0,
    mmj: statesByStatus['legal-mmj']?.length || 0,
    gray: (statesByStatus['gray-area']?.length || 0) + (statesByStatus['legal-gray']?.length || 0),
    illegal: statesByStatus['illegal']?.length || 0,
  };

  const statusOrder: LegalStatus[] = ['legal', 'legal-mmj', 'legal-gray', 'legal-restricted', 'gray-area', 'illegal'];

  const getStatusIcon = (status: LegalStatus) => {
    switch (status) {
      case 'legal':
        return <CheckCircle className="w-5 h-5" />;
      case 'legal-mmj':
        return <Shield className="w-5 h-5" />;
      case 'legal-gray':
      case 'legal-restricted':
        return <AlertTriangle className="w-5 h-5" />;
      case 'gray-area':
        return <HelpCircle className="w-5 h-5" />;
      case 'illegal':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Scale className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">US</span>
            </div>
            <span className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
              Green Deals
            </span>
          </Link>
          <nav className="flex gap-8">
            <Link href="/deals" className="text-slate-400 hover:text-white transition-colors font-medium">
              Deals
            </Link>
            <Link href="/legality" className="text-emerald-400 font-medium">
              Legality Map
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">2024 State-by-State Legal Guide</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              THCa Legality
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Across America
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Interactive map showing the current legal status of THCa in all 50 states.
              Hover over any state for detailed information.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
          >
            {[
              { label: 'Fully Legal', count: statusCounts.legal, color: '#10b981' },
              { label: 'MMJ Required', count: statusCounts.mmj, color: '#f59e0b' },
              { label: 'Gray Area', count: statusCounts.gray, color: '#6b7280' },
              { label: 'Illegal', count: statusCounts.illegal, color: '#ef4444' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-center backdrop-blur-sm"
              >
                <div
                  className="text-4xl font-bold mb-1"
                  style={{ color: stat.color }}
                >
                  {stat.count}
                </div>
                <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tab Selector */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Interactive Map
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              Full List
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {activeTab === 'map' && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/50"
            >
              <USMap
                onStateHover={handleStateHover}
                onStateClick={handleStateClick}
              />
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected State Info */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                {selectedState ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: statusColors[selectedState.status] }}
                      >
                        {selectedState.abbreviation}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedState.name}</h3>
                        <span
                          className="text-sm font-medium"
                          style={{ color: statusColors[selectedState.status] }}
                        >
                          {statusLabels[selectedState.status]}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {selectedState.description}
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm">
                      Hover over a state to see its THCa legal status
                    </p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Status Key
                </h3>
                <div className="space-y-3">
                  {statusOrder.map((status) => (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full ring-2 ring-white/10"
                        style={{ backgroundColor: statusColors[status] }}
                      />
                      <span className="text-sm text-slate-300">{statusLabels[status]}</span>
                      <span className="text-xs text-slate-600 ml-auto">
                        {statesByStatus[status]?.length || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="space-y-8">
            {statusOrder.map((status) => {
              const states = statesByStatus[status];
              if (!states || states.length === 0) return null;

              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${statusColors[status]}20`, color: statusColors[status] }}
                    >
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{statusLabels[status]}</h2>
                      <p className="text-sm text-slate-500">{states.length} state{states.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {states.sort((a, b) => a.name.localeCompare(b.name)).map((state) => (
                      <div
                        key={state.abbreviation}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="text-sm font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${statusColors[status]}20`,
                              color: statusColors[status],
                            }}
                          >
                            {state.abbreviation}
                          </span>
                          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {state.name}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-3">{state.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-amber-400 mb-2 text-lg">Important Legal Disclaimer</h3>
                <p className="text-amber-200/70 text-sm leading-relaxed">
                  This information is provided for educational purposes only and should not be considered
                  legal advice. Cannabis laws are complex and frequently changing. The legal status of THCa
                  may vary based on its source (hemp vs. marijuana), THC concentration after decarboxylation,
                  and local regulations. Always consult with a qualified attorney in your jurisdiction before
                  purchasing or using any cannabis products. We do not guarantee the accuracy or completeness
                  of this information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is THCa Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Understanding THCa</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Learn about the compound, its legal complexities, and why regulations vary by state.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'What is THCa?',
                desc: "THCa (tetrahydrocannabinolic acid) is a non-psychoactive cannabinoid found in raw cannabis plants. It's the precursor to THC and doesn't produce intoxicating effects in its raw form.",
                icon: '🧬',
              },
              {
                title: 'How Does Heating Affect THCa?',
                desc: "When THCa is heated (decarboxylated) through smoking, vaping, or cooking, it converts to psychoactive THC. This is why the legal status can differ based on intended use.",
                icon: '🔥',
              },
              {
                title: 'Federal vs. State Law',
                desc: "Under the 2018 Farm Bill, hemp products containing less than 0.3% Delta-9 THC are federally legal. However, states have their own regulations that may be more restrictive.",
                icon: '⚖️',
              },
              {
                title: 'Why "Gray Areas" Exist',
                desc: "Some states have unclear laws regarding THCa, or the compound falls into a legal gray area because while it's technically hemp-derived, heating it creates THC which may be regulated differently.",
                icon: '❓',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 border-t border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Find Verified Deals in Your State
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Browse our directory of verified wellness deals from trusted vendors.
          </p>
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all group"
          >
            View Deals Directory
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">US</span>
            </div>
            <span className="text-lg font-semibold text-white">Green Deals</span>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            &copy; {new Date().getFullYear()} US Green Deals. All rights reserved.
          </p>
          <div className="flex justify-center gap-8 text-sm text-slate-500">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <Link href="/deals" className="hover:text-emerald-400 transition-colors">Deals</Link>
            <Link href="/legality" className="hover:text-emerald-400 transition-colors">Legality</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
