'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import USMap from '@/components/USMap';
import MapLegend from '@/components/MapLegend';
import StateInfoPanel from '@/components/StateInfoPanel';
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
    <div className="min-h-screen bg-gradient-to-b from-[#faf9f6] to-[#f0efe9]">
      {/* Header */}
      <header className="bg-[#2d4a3e] text-white py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold">US Green Deals</span>
          </Link>
          <nav className="flex gap-6">
            <Link href="/deals" className="hover:text-green-300 transition-colors">
              Deals
            </Link>
            <Link href="/legality" className="text-green-300 font-medium">
              Legality Map
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#2d4a3e] text-white py-16 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
              <Scale className="w-4 h-4" />
              <span className="text-sm">State-by-State Legal Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              THCa Legality Map
            </h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Understanding THCa legality across the United States. Hover over any state
              to see its current legal status and important details.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Selector */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-[#2d4a3e] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Interactive Map
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-[#2d4a3e] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Full List
          </button>
        </div>
      </div>

      {/* Map View */}
      {activeTab === 'map' && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Map */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <USMap
                onStateHover={handleStateHover}
                onStateClick={handleStateClick}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <StateInfoPanel state={selectedState} />
              <MapLegend />
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
                <div key={status} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${statusColors[status]}20`, color: statusColors[status] }}
                    >
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{statusLabels[status]}</h2>
                      <p className="text-sm text-gray-500">{states.length} state{states.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {states.sort((a, b) => a.name.localeCompare(b.name)).map((state) => (
                      <div
                        key={state.abbreviation}
                        className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-400">{state.abbreviation}</span>
                          <h3 className="font-semibold text-gray-900">{state.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{state.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="bg-[#f5f4f0] py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Important Legal Disclaimer</h3>
                <p className="text-amber-800 text-sm leading-relaxed">
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
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Understanding THCa</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What is THCa?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                THCa (tetrahydrocannabinolic acid) is a non-psychoactive cannabinoid found in raw cannabis plants.
                It&apos;s the precursor to THC and doesn&apos;t produce intoxicating effects in its raw form.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How Does Heating Affect THCa?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                When THCa is heated (decarboxylated) through smoking, vaping, or cooking, it converts to
                psychoactive THC. This is why the legal status can differ based on intended use.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Federal vs. State Law</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Under the 2018 Farm Bill, hemp products containing less than 0.3% Delta-9 THC are federally legal.
                However, states have their own regulations that may be more restrictive.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Why &quot;Gray Areas&quot; Exist</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Some states have unclear laws regarding THCa, or the compound falls into a legal gray area
                because while it&apos;s technically hemp-derived, heating it creates THC which may be regulated differently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2d4a3e] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Find Verified Deals in Your State
          </h2>
          <p className="text-green-100 mb-8">
            Browse our directory of verified wellness deals from trusted vendors.
          </p>
          <Link
            href="/deals"
            className="inline-block bg-white text-[#2d4a3e] px-8 py-4 rounded-full font-semibold hover:bg-green-50 transition-colors"
          >
            View Deals Directory
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2f26] text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} US Green Deals. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/deals" className="hover:text-white transition-colors">Deals</Link>
            <Link href="/legality" className="hover:text-white transition-colors">Legality</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
