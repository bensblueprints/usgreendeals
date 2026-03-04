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
  BarChart3,
  Layers,
  Percent,
  Image,
  Palette,
  Type,
  User,
  Upload,
  ImageIcon,
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
  ghl_api_key: string;
  ghl_location_id: string;
  site_title: string;
  site_description: string;
}

interface LandingPage {
  id?: string;
  name: string;
  slug: string;
  background_image: string | null;
  background_color: string;
  headline: string;
  subheadline: string;
  button_text: string;
  theme: 'light' | 'dark';
  custom_css: string | null;
  active: boolean;
  traffic_weight: number;
  views: number;
  conversions: number;
  collect_first_name: boolean;
  is_homepage: boolean;
  client_id: string | null;
}

interface Client {
  id?: string;
  name: string;
  slug: string;
  klaviyo_api_key: string | null;
  klaviyo_list_id: string | null;
  active: boolean;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState('');

  const [activeTab, setActiveTab] = useState<'deals' | 'subscribers' | 'landing-pages' | 'clients' | 'settings'>('deals');

  // Deals state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // Landing Pages state
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Images state
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Clients state
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [klaviyoLists, setKlaviyoLists] = useState<{ id: string; name: string }[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SettingsData>({
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
      const [dealsRes, subscribersRes, settingsRes, pagesRes, clientsRes] = await Promise.all([
        fetch('/api/deals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/subscribers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/landing-pages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (dealsRes.ok) setDeals(await dealsRes.json());
      if (subscribersRes.ok) setSubscribers(await subscribersRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (pagesRes.ok) {
        const data = await pagesRes.json();
        setLandingPages(data.pages || []);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }

      // Also load images
      await loadImages(token);
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

  const saveLandingPage = async (page: LandingPage) => {
    setLoading(true);
    try {
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(page),
      });

      if (response.ok) {
        showMessage('success', page.id ? 'Landing page updated!' : 'Landing page created!');
        setEditingPage(null);
        setIsCreatingPage(false);
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to save landing page');
      }
    } catch {
      showMessage('error', 'Failed to save landing page');
    } finally {
      setLoading(false);
    }
  };

  const deleteLandingPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/landing-pages?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Landing page deleted!');
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to delete landing page');
      }
    } catch {
      showMessage('error', 'Failed to delete landing page');
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

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/subscribers?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Subscriber deleted!');
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to delete subscriber');
      }
    } catch {
      showMessage('error', 'Failed to delete subscriber');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (token: string) => {
    try {
      const response = await fetch('/api/images', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', 'Image uploaded!');
        await loadImages(authToken);
        return data.url;
      } else {
        showMessage('error', 'Failed to upload image');
        return null;
      }
    } catch {
      showMessage('error', 'Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteImage = async (name: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/images?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Image deleted!');
        await loadImages(authToken);
      } else {
        showMessage('error', 'Failed to delete image');
      }
    } catch {
      showMessage('error', 'Failed to delete image');
    }
  };

  const selectImage = (url: string) => {
    if (editingPage) {
      setEditingPage({ ...editingPage, background_image: url });
    }
    setShowImageSelector(false);
  };

  const fetchKlaviyoLists = async (apiKey: string) => {
    if (!apiKey || apiKey.length < 10) {
      setKlaviyoLists([]);
      return;
    }

    setLoadingLists(true);
    try {
      const response = await fetch(`/api/klaviyo?api_key=${encodeURIComponent(apiKey)}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setKlaviyoLists(data.lists || []);
      } else {
        setKlaviyoLists([]);
      }
    } catch {
      setKlaviyoLists([]);
    } finally {
      setLoadingLists(false);
    }
  };

  // Fetch Klaviyo lists when editing client and API key changes
  useEffect(() => {
    if (editingClient?.klaviyo_api_key) {
      const timeoutId = setTimeout(() => {
        fetchKlaviyoLists(editingClient.klaviyo_api_key || '');
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    } else {
      setKlaviyoLists([]);
    }
  }, [editingClient?.klaviyo_api_key]);

  const saveClientData = async (client: Client) => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(client),
      });

      if (response.ok) {
        showMessage('success', client.id ? 'Client updated!' : 'Client created!');
        setEditingClient(null);
        setIsCreatingClient(false);
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to save client');
      }
    } catch {
      showMessage('error', 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const deleteClientData = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/clients?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Client deleted!');
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to delete client');
      }
    } catch {
      showMessage('error', 'Failed to delete client');
    } finally {
      setLoading(false);
    }
  };

  const setAsHomepage = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/landing-pages?action=set-homepage&id=${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Homepage updated!');
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to set homepage');
      }
    } catch {
      showMessage('error', 'Failed to set homepage');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for landing pages
  const totalViews = landingPages.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalConversions = landingPages.reduce((sum, p) => sum + (p.conversions || 0), 0);
  const overallConversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : '0';

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
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'deals', label: 'Deals', icon: Tag },
            { key: 'subscribers', label: 'Subscribers', icon: Users },
            { key: 'landing-pages', label: 'A/B Testing', icon: Layers },
            { key: 'clients', label: 'Clients', icon: Users },
            { key: 'settings', label: 'Settings', icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--forest)]">Actions</th>
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
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteSubscriber(sub.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete subscriber"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
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

        {/* Landing Pages / A/B Testing Tab */}
        {activeTab === 'landing-pages' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-[var(--forest)]/60">Total Views</span>
                </div>
                <p className="text-3xl font-bold text-[var(--forest)]">{totalViews.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-[var(--forest)]/60">Total Conversions</span>
                </div>
                <p className="text-3xl font-bold text-[var(--forest)]">{totalConversions.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-[var(--forest)]/60">Conversion Rate</span>
                </div>
                <p className="text-3xl font-bold text-[var(--forest)]">{overallConversionRate}%</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-[var(--forest)]">Landing Page Variants</h2>
              <button
                onClick={() => {
                  setIsCreatingPage(true);
                  setEditingPage({
                    name: '',
                    slug: '',
                    background_image: null,
                    background_color: '#1a1a2e',
                    headline: 'Exclusive Green Lifestyle Deals',
                    subheadline: 'Join our exclusive list for premium wellness deals.',
                    button_text: 'Get Exclusive Deals',
                    theme: 'light',
                    custom_css: null,
                    active: true,
                    traffic_weight: 50,
                    views: 0,
                    conversions: 0,
                    collect_first_name: false,
                    is_homepage: false,
                    client_id: null,
                  });
                }}
                className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Variant
              </button>
            </div>

            {/* Landing Page Editor Modal */}
            <AnimatePresence>
              {(editingPage || isCreatingPage) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => {
                    setEditingPage(null);
                    setIsCreatingPage(false);
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-xl text-[var(--forest)]">
                        {editingPage?.id ? 'Edit Landing Page' : 'New Landing Page'}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingPage(null);
                          setIsCreatingPage(false);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Name</label>
                          <input
                            type="text"
                            value={editingPage?.name || ''}
                            onChange={(e) => setEditingPage({ ...editingPage!, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                            placeholder="e.g., Psychedelic Gorilla"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Slug</label>
                          <input
                            type="text"
                            value={editingPage?.slug || ''}
                            onChange={(e) => setEditingPage({ ...editingPage!, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                            placeholder="e.g., gorilla"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                          <Type className="w-4 h-4 inline mr-1" /> Headline
                        </label>
                        <input
                          type="text"
                          value={editingPage?.headline || ''}
                          onChange={(e) => setEditingPage({ ...editingPage!, headline: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="Exclusive Green Lifestyle Deals"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Subheadline</label>
                        <textarea
                          value={editingPage?.subheadline || ''}
                          onChange={(e) => setEditingPage({ ...editingPage!, subheadline: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)] resize-none"
                          rows={2}
                          placeholder="Join our exclusive list..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Button Text</label>
                        <input
                          type="text"
                          value={editingPage?.button_text || ''}
                          onChange={(e) => setEditingPage({ ...editingPage!, button_text: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="Get Exclusive Deals"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                            <Palette className="w-4 h-4 inline mr-1" /> Theme
                          </label>
                          <select
                            value={editingPage?.theme || 'light'}
                            onChange={(e) => setEditingPage({ ...editingPage!, theme: e.target.value as 'light' | 'dark' })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          >
                            <option value="light">Light (Original)</option>
                            <option value="dark">Dark (Psychedelic)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                            <BarChart3 className="w-4 h-4 inline mr-1" /> Traffic Weight (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingPage?.traffic_weight || 50}
                            onChange={(e) => setEditingPage({ ...editingPage!, traffic_weight: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                          <Image className="w-4 h-4 inline mr-1" /> Background Image
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingPage?.background_image || ''}
                              onChange={(e) => setEditingPage({ ...editingPage!, background_image: e.target.value || null })}
                              className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                              placeholder="Select or upload an image..."
                            />
                            <button
                              type="button"
                              onClick={() => setShowImageSelector(true)}
                              className="px-4 py-3 rounded-xl bg-[var(--sage-light)] hover:bg-[var(--sage)]/30 text-[var(--forest)] flex items-center gap-2"
                            >
                              <ImageIcon className="w-5 h-5" />
                              Browse
                            </button>
                          </div>
                          {editingPage?.background_image && (
                            <div className="relative w-32 h-20 rounded-lg overflow-hidden border-2 border-[var(--sage)]/30">
                              <img
                                src={editingPage.background_image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setEditingPage({ ...editingPage!, background_image: null })}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image Selector Modal */}
                      <AnimatePresence>
                        {showImageSelector && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
                            onClick={() => setShowImageSelector(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="font-display text-xl text-[var(--forest)]">Select Background Image</h3>
                                <button
                                  onClick={() => setShowImageSelector(false)}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Upload Section */}
                              <div className="mb-4 p-4 border-2 border-dashed border-[var(--sage)]/50 rounded-xl">
                                <label className="flex flex-col items-center cursor-pointer">
                                  <Upload className="w-8 h-8 text-[var(--sage)] mb-2" />
                                  <span className="text-sm text-[var(--forest)]/70">
                                    {uploadingImage ? 'Uploading...' : 'Click to upload new image'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingImage}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = await uploadImage(file);
                                        if (url) {
                                          selectImage(url);
                                        }
                                      }
                                    }}
                                  />
                                </label>
                              </div>

                              {/* Default Images */}
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-[var(--forest)]/70 mb-2">Default Images</h4>
                                <div className="grid grid-cols-3 gap-3">
                                  <button
                                    onClick={() => selectImage('/gorilla-bg.png')}
                                    className="relative aspect-video rounded-lg overflow-hidden border-2 border-[var(--sage)]/30 hover:border-[var(--primary)] transition-colors"
                                  >
                                    <img src="/gorilla-bg.png" alt="Gorilla" className="w-full h-full object-cover" />
                                    <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                                      Gorilla
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* Uploaded Images */}
                              {uploadedImages.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-[var(--forest)]/70 mb-2">Uploaded Images</h4>
                                  <div className="grid grid-cols-3 gap-3">
                                    {uploadedImages.map((img) => (
                                      <div key={img.name} className="relative group">
                                        <button
                                          onClick={() => selectImage(img.url)}
                                          className="relative aspect-video rounded-lg overflow-hidden border-2 border-[var(--sage)]/30 hover:border-[var(--primary)] transition-colors w-full"
                                        >
                                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                        </button>
                                        <button
                                          onClick={() => deleteImage(img.name)}
                                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Background Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingPage?.background_color || '#1a1a2e'}
                            onChange={(e) => setEditingPage({ ...editingPage!, background_color: e.target.value })}
                            className="w-14 h-12 rounded-xl border-2 border-[var(--sage)]/30 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingPage?.background_color || '#1a1a2e'}
                            onChange={(e) => setEditingPage({ ...editingPage!, background_color: e.target.value })}
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Custom CSS (optional)</label>
                        <textarea
                          value={editingPage?.custom_css || ''}
                          onChange={(e) => setEditingPage({ ...editingPage!, custom_css: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)] resize-none font-mono text-sm"
                          rows={3}
                          placeholder="/* Custom CSS styles */"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="page-active"
                          checked={editingPage?.active ?? true}
                          onChange={(e) => setEditingPage({ ...editingPage!, active: e.target.checked })}
                          className="w-5 h-5 rounded border-[var(--sage)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <label htmlFor="page-active" className="text-sm font-medium text-[var(--forest)]">
                          Active (included in A/B test rotation)
                        </label>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                        <input
                          type="checkbox"
                          id="collect-first-name"
                          checked={editingPage?.collect_first_name ?? false}
                          onChange={(e) => setEditingPage({ ...editingPage!, collect_first_name: e.target.checked })}
                          className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="collect-first-name" className="text-sm font-medium text-blue-900 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Collect First Name
                          </label>
                          <p className="text-xs text-blue-700 mt-1">
                            Enable to test if asking for first name affects conversion rate
                          </p>
                        </div>
                      </div>

                      {/* Client Selection */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                          Client (Klaviyo List)
                        </label>
                        <select
                          value={editingPage?.client_id || ''}
                          onChange={(e) => setEditingPage({ ...editingPage!, client_id: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                        >
                          <option value="">Default (Global Settings)</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} {client.klaviyo_list_id ? `(${client.klaviyo_list_id})` : '(No list)'}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-[var(--forest)]/50 mt-1">
                          Select which Klaviyo list to sync subscribers to
                        </p>
                      </div>

                      <button
                        onClick={() => editingPage && saveLandingPage(editingPage)}
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Landing Page
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Landing Pages List */}
            <div className="grid gap-4">
              {landingPages.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <Layers className="w-12 h-12 text-[var(--sage)] mx-auto mb-4" />
                  <p className="text-[var(--forest)]/60">No landing pages yet. Create your first variant!</p>
                </div>
              ) : (
                landingPages.map((page) => {
                  const conversionRate = page.views > 0 ? ((page.conversions / page.views) * 100).toFixed(1) : '0';
                  return (
                    <div
                      key={page.id}
                      className={`bg-white rounded-2xl p-5 ${!page.active ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: page.theme === 'dark' ? '#1a1a2e' : 'var(--sage-light)' }}
                            >
                              {page.theme === 'dark' ? (
                                <Palette className="w-5 h-5 text-purple-400" />
                              ) : (
                                <Leaf className="w-5 h-5 text-[var(--primary)]" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--forest)]">{page.name}</h3>
                              <p className="text-xs text-[var(--forest)]/50">/{page.slug}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${page.theme === 'dark' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                              {page.theme}
                            </span>
                            {page.is_homepage && (
                              <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                Homepage
                              </span>
                            )}
                            {page.collect_first_name && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                First Name
                              </span>
                            )}
                            {page.client_id && (
                              <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                                {clients.find(c => c.id === page.client_id)?.name || 'Client'}
                              </span>
                            )}
                            {!page.active && (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                                Inactive
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-[var(--forest)]/70 mb-3 line-clamp-1">{page.headline}</p>

                          {/* Stats Row */}
                          <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-[var(--sage)]" />
                              <span className="text-[var(--forest)]/60">Weight:</span>
                              <span className="font-semibold text-[var(--forest)]">{page.traffic_weight}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-blue-500" />
                              <span className="text-[var(--forest)]/60">Views:</span>
                              <span className="font-semibold text-[var(--forest)]">{page.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-[var(--forest)]/60">Conversions:</span>
                              <span className="font-semibold text-[var(--forest)]">{page.conversions.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Percent className="w-4 h-4 text-purple-500" />
                              <span className="text-[var(--forest)]/60">Rate:</span>
                              <span className="font-semibold text-[var(--forest)]">{conversionRate}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!page.is_homepage && (
                            <button
                              onClick={() => page.id && setAsHomepage(page.id)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors"
                              title="Set as homepage"
                            >
                              Set Home
                            </button>
                          )}
                          <button
                            onClick={() => setEditingPage(page)}
                            className="p-2 hover:bg-[var(--sage-light)] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-5 h-5 text-[var(--forest)]" />
                          </button>
                          <button
                            onClick={() => page.id && deleteLandingPage(page.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-[var(--forest)]">Manage Clients</h2>
              <button
                onClick={() => {
                  setIsCreatingClient(true);
                  setEditingClient({
                    name: '',
                    slug: '',
                    klaviyo_api_key: null,
                    klaviyo_list_id: null,
                    active: true,
                  });
                }}
                className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Client
              </button>
            </div>

            <p className="text-sm text-[var(--forest)]/70">
              Each client can have their own Klaviyo list. When a landing page is linked to a client,
              subscribers will sync to that client&apos;s Klaviyo list.
            </p>

            {/* Client Editor Modal */}
            <AnimatePresence>
              {(editingClient || isCreatingClient) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  onClick={() => {
                    setEditingClient(null);
                    setIsCreatingClient(false);
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-xl text-[var(--forest)]">
                        {editingClient?.id ? 'Edit Client' : 'New Client'}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingClient(null);
                          setIsCreatingClient(false);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Client Name</label>
                        <input
                          type="text"
                          value={editingClient?.name || ''}
                          onChange={(e) => setEditingClient({ ...editingClient!, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="e.g., CBD Store"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Slug</label>
                        <input
                          type="text"
                          value={editingClient?.slug || ''}
                          onChange={(e) => setEditingClient({ ...editingClient!, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="e.g., cbd-store"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Klaviyo API Key</label>
                        <input
                          type="password"
                          value={editingClient?.klaviyo_api_key || ''}
                          onChange={(e) => setEditingClient({ ...editingClient!, klaviyo_api_key: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="pk_..."
                        />
                        <p className="text-xs text-[var(--forest)]/50 mt-1">
                          Enter API key to load available lists
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Klaviyo List</label>
                        {loadingLists ? (
                          <div className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 bg-gray-50 flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                            <span className="text-sm text-[var(--forest)]/60">Loading lists...</span>
                          </div>
                        ) : klaviyoLists.length > 0 ? (
                          <select
                            value={editingClient?.klaviyo_list_id || ''}
                            onChange={(e) => setEditingClient({ ...editingClient!, klaviyo_list_id: e.target.value || null })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          >
                            <option value="">Select a list...</option>
                            {klaviyoLists.map((list) => (
                              <option key={list.id} value={list.id}>
                                {list.name} ({list.id})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editingClient?.klaviyo_list_id || ''}
                            onChange={(e) => setEditingClient({ ...editingClient!, klaviyo_list_id: e.target.value || null })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                            placeholder={editingClient?.klaviyo_api_key ? 'No lists found' : 'Enter API key first'}
                            disabled={!editingClient?.klaviyo_api_key}
                          />
                        )}
                        {editingClient?.klaviyo_list_id && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            List ID: {editingClient.klaviyo_list_id}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="client-active"
                          checked={editingClient?.active ?? true}
                          onChange={(e) => setEditingClient({ ...editingClient!, active: e.target.checked })}
                          className="w-5 h-5 rounded border-[var(--sage)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <label htmlFor="client-active" className="text-sm font-medium text-[var(--forest)]">
                          Active
                        </label>
                      </div>

                      <button
                        onClick={() => editingClient && saveClientData(editingClient)}
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Client
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clients List */}
            <div className="grid gap-4">
              {clients.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <Users className="w-12 h-12 text-[var(--sage)] mx-auto mb-4" />
                  <p className="text-[var(--forest)]/60">No clients yet. Add your first client!</p>
                </div>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className={`bg-white rounded-2xl p-5 flex items-center gap-4 ${
                      !client.active ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--forest)]">{client.name}</h3>
                        <span className="text-xs text-[var(--forest)]/50">/{client.slug}</span>
                        {!client.active && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--forest)]/60">
                        {client.klaviyo_list_id ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            List: {client.klaviyo_list_id}
                          </span>
                        ) : (
                          <span className="text-amber-600">No Klaviyo list configured</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingClient(client)}
                        className="p-2 hover:bg-[var(--sage-light)] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-[var(--forest)]" />
                      </button>
                      <button
                        onClick={() => client.id && deleteClientData(client.id)}
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-display text-2xl text-[var(--forest)]">Integration Settings</h2>

            {/* Klaviyo Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Klaviyo integration is now managed per-client in the <strong>Clients</strong> tab.
                Each client can have their own Klaviyo API key and list.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--forest)]">GoHighLevel Integration</h3>
                <button
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="text-sm text-[var(--primary)] flex items-center gap-1"
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showApiKeys ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="space-y-4">
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
