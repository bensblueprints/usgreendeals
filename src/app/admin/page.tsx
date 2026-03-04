'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Lock,
  Settings,
  Users,
  Tag,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Mail,
  MapPin,
} from 'lucide-react';

interface Deal {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  discount: string;
  active: boolean;
  sort_order: number;
}

interface Subscriber {
  id: string;
  email: string;
  zip_code: string;
  created_at: string;
  source: string;
  synced_klaviyo: boolean;
  synced_ghl: boolean;
}

interface SettingsData {
  klaviyo_api_key: string;
  klaviyo_list_id: string;
  ghl_api_key: string;
  ghl_location_id: string;
  site_title: string;
  site_description: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState('');

  const [activeTab, setActiveTab] = useState<'deals' | 'subscribers' | 'settings'>('deals');

  // Deals state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Settings state
  const [settings, setSettings] = useState<SettingsData>({
    klaviyo_api_key: '',
    klaviyo_list_id: '',
    ghl_api_key: '',
    ghl_location_id: '',
    site_title: '',
    site_description: '',
  });
  const [showApiKeys, setShowApiKeys] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthToken(password);
        loadData(password);
      } else {
        setAuthError('Invalid password');
      }
    } catch {
      setAuthError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (token: string) => {
    setLoading(true);
    try {
      const [dealsRes, subscribersRes, settingsRes] = await Promise.all([
        fetch('/api/deals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/subscribers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (dealsRes.ok) setDeals(await dealsRes.json());
      if (subscribersRes.ok) setSubscribers(await subscribersRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveDeal = async (deal: Deal) => {
    setLoading(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(deal),
      });

      if (response.ok) {
        showMessage('success', deal.id ? 'Deal updated!' : 'Deal created!');
        setEditingDeal(null);
        setIsCreatingDeal(false);
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to save deal');
      }
    } catch {
      showMessage('error', 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  const deleteDeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/deals?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Deal deleted!');
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to delete deal');
      }
    } catch {
      showMessage('error', 'Failed to delete deal');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showMessage('success', 'Settings saved!');
      } else {
        showMessage('error', 'Failed to save settings');
      }
    } catch {
      showMessage('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const exportSubscribers = () => {
    const csv = [
      ['Email', 'Zip Code', 'Subscribed', 'Source', 'Klaviyo Synced', 'GHL Synced'].join(','),
      ...subscribers.map(s =>
        [s.email, s.zip_code, new Date(s.created_at).toLocaleDateString(), s.source, s.synced_klaviyo ? 'Yes' : 'No', s.synced_ghl ? 'Yes' : 'No'].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--moss)] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-2xl font-semibold text-[var(--forest)]">Admin Portal</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--sage)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 border-2 border-[var(--sage)]/30 text-[var(--forest)] focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {authError && (
                <p className="text-red-500 text-sm text-center">{authError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-[var(--sage)]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--moss)] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-[var(--forest)]">US Green Deals Admin</span>
          </div>

          <button
            onClick={() => loadData(authToken)}
            className="p-2 rounded-lg hover:bg-[var(--sage-light)]/50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-[var(--forest)] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Message toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-8">
          {[
            { key: 'deals', label: 'Deals', icon: Tag },
            { key: 'subscribers', label: 'Subscribers', icon: Users },
            { key: 'settings', label: 'Settings', icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--moss)] text-white shadow-lg'
                  : 'bg-white hover:bg-[var(--sage-light)]/50 text-[var(--forest)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-[var(--forest)]">Manage Deals</h2>
              <button
                onClick={() => {
                  setIsCreatingDeal(true);
                  setEditingDeal({
                    title: '',
                    description: '',
                    image_url: '',
                    link: '',
                    discount: '',
                    active: true,
                    sort_order: deals.length,
                  });
                }}
                className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Deal
              </button>
            </div>

            {/* Deal Editor Modal */}
            <AnimatePresence>
              {(editingDeal || isCreatingDeal) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => {
                    setEditingDeal(null);
                    setIsCreatingDeal(false);
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-xl text-[var(--forest)]">
                        {editingDeal?.id ? 'Edit Deal' : 'New Deal'}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingDeal(null);
                          setIsCreatingDeal(false);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Title</label>
                        <input
                          type="text"
                          value={editingDeal?.title || ''}
                          onChange={(e) => setEditingDeal({ ...editingDeal!, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="Deal title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Description</label>
                        <textarea
                          value={editingDeal?.description || ''}
                          onChange={(e) => setEditingDeal({ ...editingDeal!, description: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)] resize-none"
                          rows={3}
                          placeholder="Short description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Image URL</label>
                        <input
                          type="url"
                          value={editingDeal?.image_url || ''}
                          onChange={(e) => setEditingDeal({ ...editingDeal!, image_url: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Link URL</label>
                        <input
                          type="url"
                          value={editingDeal?.link || ''}
                          onChange={(e) => setEditingDeal({ ...editingDeal!, link: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Discount</label>
                          <input
                            type="text"
                            value={editingDeal?.discount || ''}
                            onChange={(e) => setEditingDeal({ ...editingDeal!, discount: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                            placeholder="20% OFF"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Sort Order</label>
                          <input
                            type="number"
                            value={editingDeal?.sort_order || 0}
                            onChange={(e) => setEditingDeal({ ...editingDeal!, sort_order: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="active"
                          checked={editingDeal?.active ?? true}
                          onChange={(e) => setEditingDeal({ ...editingDeal!, active: e.target.checked })}
                          className="w-5 h-5 rounded border-[var(--sage)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <label htmlFor="active" className="text-sm font-medium text-[var(--forest)]">
                          Active (visible on thank you page)
                        </label>
                      </div>

                      <button
                        onClick={() => editingDeal && saveDeal(editingDeal)}
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Deal
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Deals List */}
            <div className="grid gap-4">
              {deals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <Tag className="w-12 h-12 text-[var(--sage)] mx-auto mb-4" />
                  <p className="text-[var(--forest)]/60">No deals yet. Add your first deal!</p>
                </div>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className={`bg-white rounded-2xl p-5 flex items-center gap-4 ${
                      !deal.active ? 'opacity-60' : ''
                    }`}
                  >
                    {deal.image_url ? (
                      <img
                        src={deal.image_url}
                        alt={deal.title}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-[var(--sage-light)] rounded-xl flex items-center justify-center">
                        <Tag className="w-8 h-8 text-[var(--sage)]" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--forest)]">{deal.title}</h3>
                        {deal.discount && (
                          <span className="px-2 py-1 text-xs rounded-full bg-[var(--primary)] text-white">
                            {deal.discount}
                          </span>
                        )}
                        {!deal.active && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--forest)]/60 line-clamp-1">{deal.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingDeal(deal)}
                        className="p-2 hover:bg-[var(--sage-light)] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-[var(--forest)]" />
                      </button>
                      <button
                        onClick={() => deal.id && deleteDeal(deal.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-[var(--forest)]">
                Subscribers ({subscribers.length})
              </h2>
              <button
                onClick={exportSubscribers}
                className="px-6 py-3 rounded-xl bg-white hover:bg-[var(--sage-light)]/50 text-[var(--forest)] font-medium flex items-center gap-2 border border-[var(--sage)]/30"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden">
              {subscribers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[var(--sage)] mx-auto mb-4" />
                  <p className="text-[var(--forest)]/60">No subscribers yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--cream)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--forest)]">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--forest)]">Zip Code</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--forest)]">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--forest)]">Klaviyo</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--forest)]">GHL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--sage)]/10">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[var(--sage-light)]/20">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-[var(--sage)]" />
                              <span className="text-sm text-[var(--forest)]">{sub.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[var(--sage)]" />
                              <span className="text-sm text-[var(--forest)]">{sub.zip_code || '-'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--forest)]/60">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {sub.synced_klaviyo ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-gray-300" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {sub.synced_ghl ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-gray-300" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-display text-2xl text-[var(--forest)]">Integration Settings</h2>

            <div className="bg-white rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--forest)]">API Keys</h3>
                <button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="text-sm text-[var(--primary)] flex items-center gap-1"
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showApiKeys ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Klaviyo Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-[var(--forest)]/80">Klaviyo Integration</h4>

                <div>
                  <label className="block text-sm text-[var(--forest)]/60 mb-1">API Key</label>
                  <input
                    type={showApiKeys ? 'text' : 'password'}
                    value={settings.klaviyo_api_key}
                    onChange={(e) => setSettings({ ...settings, klaviyo_api_key: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                    placeholder="pk_..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--forest)]/60 mb-1">List ID</label>
                  <input
                    type="text"
                    value={settings.klaviyo_list_id}
                    onChange={(e) => setSettings({ ...settings, klaviyo_list_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                    placeholder="ABC123"
                  />
                </div>
              </div>

              {/* GHL Settings */}
              <div className="space-y-4 pt-4 border-t border-[var(--sage)]/20">
                <h4 className="text-sm font-medium text-[var(--forest)]/80">GoHighLevel Integration</h4>

                <div>
                  <label className="block text-sm text-[var(--forest)]/60 mb-1">API Key</label>
                  <input
                    type={showApiKeys ? 'text' : 'password'}
                    value={settings.ghl_api_key}
                    onChange={(e) => setSettings({ ...settings, ghl_api_key: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                    placeholder="pit-..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--forest)]/60 mb-1">Location ID</label>
                  <input
                    type="text"
                    value={settings.ghl_location_id}
                    onChange={(e) => setSettings({ ...settings, ghl_location_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                    placeholder="fl5rL..."
                  />
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
