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
  Video,
  Play,
  LayoutDashboard,
  Heart,
  FolderOpen,
  Link2,
  ArrowRight,
  ExternalLink,
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
  client_id: string | null;
  impressions: number;
  clicks: number;
}

interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  zip_code: string;
  created_at: string;
  source: string;
  synced_klaviyo: boolean;
  synced_ghl: boolean;
  landing_page_id: string | null;
  client_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
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
  video_url: string | null;
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
  klaviyo_list_id: string | null;
  show_logo: boolean;
  logo_url: string | null;
  thank_you_page_id: string | null;
}

interface ThankYouPage {
  id?: string;
  name: string;
  slug: string;
  client_id: string | null;
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
  active: boolean;
}

interface ClientMedia {
  id: string;
  client_id: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'gif';
  file_size: number | null;
  folder: string;
  uploaded_at: string;
}

interface Client {
  id?: string;
  name: string;
  slug: string;
  klaviyo_api_key: string | null;
  klaviyo_list_id: string | null;
  logo_url: string | null;
  active: boolean;
  is_default?: boolean;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'deals' | 'subscribers' | 'landing-pages' | 'thank-you-pages' | 'clients' | 'media' | 'settings'>('dashboard');

  // Deals state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [syncingSubscriberId, setSyncingSubscriberId] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Landing Pages state
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Images state
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Videos state
  const [uploadedVideos, setUploadedVideos] = useState<{ name: string; url: string }[]>([]);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Clients state
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [klaviyoLists, setKlaviyoLists] = useState<{ id: string; name: string }[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [pageLists, setPageLists] = useState<{ id: string; name: string }[]>([]);
  const [loadingPageLists, setLoadingPageLists] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Thank You Pages state
  const [thankYouPages, setThankYouPages] = useState<ThankYouPage[]>([]);
  const [editingThankYouPage, setEditingThankYouPage] = useState<ThankYouPage | null>(null);
  const [isCreatingThankYouPage, setIsCreatingThankYouPage] = useState(false);

  // Client Media state
  const [clientMedia, setClientMedia] = useState<ClientMedia[]>([]);
  const [selectedMediaClient, setSelectedMediaClient] = useState<string>('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaFolder, setMediaFolder] = useState<string>('general');
  const [showClientMediaBrowser, setShowClientMediaBrowser] = useState(false);
  const [mediaBrowserCallback, setMediaBrowserCallback] = useState<((url: string) => void) | null>(null);

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
      const [dealsRes, subscribersRes, settingsRes, pagesRes, clientsRes, thankYouRes] = await Promise.all([
        fetch('/api/deals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/subscribers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/landing-pages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/clients', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/thank-you-pages', { headers: { Authorization: `Bearer ${token}` } }),
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
      if (thankYouRes.ok) {
        const data = await thankYouRes.json();
        setThankYouPages(data.pages || []);
      }

      // Also load images and videos
      await loadImages(token);
      await loadVideos(token);
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

  const resetLandingPageStats = async (id: string) => {
    if (!confirm('Reset views and conversions to 0 for this page?')) return;

    try {
      const response = await fetch(`/api/landing-pages?action=reset-stats&id=${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Stats reset!');
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to reset stats');
      }
    } catch {
      showMessage('error', 'Failed to reset stats');
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

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  const syncSubscriberToKlaviyo = async (subscriberId: string) => {
    setSyncingSubscriberId(subscriberId);
    addDebugLog(`Starting sync for subscriber: ${subscriberId}`);
    setShowDebugPanel(true);

    try {
      const response = await fetch('/api/debug/klaviyo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subscriberId }),
      });

      const data = await response.json();
      addDebugLog(`Response status: ${response.status}`);
      addDebugLog(`Response: ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.success) {
        showMessage('success', `Synced to Klaviyo: ${data.details?.subscriber || 'Success'}`);
        addDebugLog(`✅ SUCCESS: Synced ${data.details?.subscriber} to list ${data.details?.listId}`);
        loadData(authToken);
      } else {
        showMessage('error', `Sync failed: ${data.error || 'Unknown error'}`);
        addDebugLog(`❌ FAILED: ${data.error}`);
        if (data.klaviyoError) {
          addDebugLog(`Klaviyo Error: ${JSON.stringify(data.klaviyoError, null, 2)}`);
        }
        if (data.klaviyoStatus) {
          addDebugLog(`Klaviyo Status: ${data.klaviyoStatus}`);
        }
      }
    } catch (err) {
      showMessage('error', 'Failed to sync to Klaviyo');
      addDebugLog(`❌ EXCEPTION: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSyncingSubscriberId(null);
    }
  };

  const fetchDebugInfo = async () => {
    addDebugLog('Fetching debug info...');
    try {
      const response = await fetch('/api/debug/klaviyo');
      const data = await response.json();
      addDebugLog(`Debug info: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      addDebugLog(`Error fetching debug: ${err instanceof Error ? err.message : 'Unknown'}`);
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

  // Video functions
  const loadVideos = async (token: string) => {
    try {
      const response = await fetch('/api/videos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const uploadVideo = async (file: File) => {
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        showMessage('success', 'Video uploaded!');
        await loadVideos(authToken);
        return data.url;
      } else {
        const errorData = await response.json();
        showMessage('error', errorData.error || 'Failed to upload video');
        return null;
      }
    } catch {
      showMessage('error', 'Failed to upload video');
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  const deleteVideo = async (name: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/videos?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Video deleted!');
        await loadVideos(authToken);
      } else {
        showMessage('error', 'Failed to delete video');
      }
    } catch {
      showMessage('error', 'Failed to delete video');
    }
  };

  const selectVideo = (url: string) => {
    if (editingPage) {
      setEditingPage({ ...editingPage, video_url: url });
    }
    setShowVideoSelector(false);
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

  // Fetch Klaviyo lists for landing page's client
  const fetchPageClientLists = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client?.klaviyo_api_key) {
      setPageLists([]);
      return;
    }

    setLoadingPageLists(true);
    try {
      const response = await fetch(`/api/klaviyo?api_key=${encodeURIComponent(client.klaviyo_api_key)}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPageLists(data.lists || []);
      } else {
        setPageLists([]);
      }
    } catch {
      setPageLists([]);
    } finally {
      setLoadingPageLists(false);
    }
  };

  // Fetch lists when editing landing page client changes
  useEffect(() => {
    if (editingPage?.client_id) {
      fetchPageClientLists(editingPage.client_id);
    } else {
      setPageLists([]);
    }
  }, [editingPage?.client_id, clients]);

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

  const uploadClientLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/client-logos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (editingClient) {
          setEditingClient({ ...editingClient, logo_url: data.url });
        }
        showMessage('success', 'Logo uploaded!');
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to upload logo');
      }
    } catch {
      showMessage('error', 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeClientLogo = async () => {
    if (!editingClient?.logo_url) return;

    // Extract filename from URL
    const urlParts = editingClient.logo_url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      await fetch(`/api/client-logos?name=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch {
      // Ignore delete errors - the file may not exist
    }

    setEditingClient({ ...editingClient, logo_url: null });
    showMessage('success', 'Logo removed');
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

  const setDefaultClientAction = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients?action=set-default&id=${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        showMessage('success', 'Default client updated!');
        loadData(authToken);
      } else {
        showMessage('error', 'Failed to set default client');
      }
    } catch {
      showMessage('error', 'Failed to set default client');
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
            { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { key: 'landing-pages', label: 'Landing Pages', icon: Layers },
            { key: 'thank-you-pages', label: 'Thank You Pages', icon: Heart },
            { key: 'clients', label: 'Clients', icon: Users },
            { key: 'media', label: 'Media Library', icon: FolderOpen },
            { key: 'subscribers', label: 'Subscribers', icon: Mail },
            { key: 'deals', label: 'Deals', icon: Tag },
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
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-[var(--forest)]">Page Connections Dashboard</h2>
            <p className="text-[var(--forest)]/70">
              Overview of all landing pages and their connected thank you pages.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--forest)]">{landingPages.length}</p>
                    <p className="text-sm text-[var(--forest)]/60">Landing Pages</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--forest)]">{thankYouPages.length}</p>
                    <p className="text-sm text-[var(--forest)]/60">Thank You Pages</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--forest)]">{clients.length}</p>
                    <p className="text-sm text-[var(--forest)]/60">Clients</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--forest)]">
                      {landingPages.filter(p => p.thank_you_page_id).length}
                    </p>
                    <p className="text-sm text-[var(--forest)]/60">Connected Pages</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Connections Table */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-[var(--forest)]">Page Connections</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[var(--forest)]/60 uppercase tracking-wider">Client</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[var(--forest)]/60 uppercase tracking-wider">Landing Page</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-[var(--forest)]/60 uppercase tracking-wider">Connection</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[var(--forest)]/60 uppercase tracking-wider">Thank You Page</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-[var(--forest)]/60 uppercase tracking-wider">Views</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-[var(--forest)]/60 uppercase tracking-wider">Conv.</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-[var(--forest)]/60 uppercase tracking-wider">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {landingPages.map((page) => {
                      const client = clients.find(c => c.id === page.client_id);
                      const thankYouPage = thankYouPages.find(tp => tp.id === page.thank_you_page_id);
                      const convRate = page.views > 0 ? ((page.conversions / page.views) * 100).toFixed(1) : '0';
                      return (
                        <tr key={page.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {client?.logo_url ? (
                                <img src={client.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              <span className="text-sm font-medium text-[var(--forest)]">{client?.name || 'No Client'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-medium text-[var(--forest)]">{page.name}</p>
                              <p className="text-xs text-[var(--forest)]/50">/{page.slug}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {page.thank_you_page_id ? (
                              <ArrowRight className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Not linked</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {thankYouPage ? (
                              <div>
                                <p className="text-sm font-medium text-[var(--forest)]">{thankYouPage.name}</p>
                                <p className="text-xs text-[var(--forest)]/50">/{thankYouPage.slug}</p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-sm font-medium text-[var(--forest)]">{page.views.toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-sm font-medium text-[var(--forest)]">{page.conversions.toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-sm font-medium ${Number(convRate) >= 5 ? 'text-green-600' : Number(convRate) >= 2 ? 'text-amber-600' : 'text-[var(--forest)]'}`}>
                              {convRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {landingPages.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-[var(--forest)]/60">
                          No landing pages yet. Create your first landing page to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="font-display text-2xl text-[var(--forest)]">Manage Deals</h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedClientFilter}
                  onChange={(e) => setSelectedClientFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)] text-sm"
                >
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
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
                    client_id: selectedClientFilter !== 'all' ? selectedClientFilter : null,
                    impressions: 0,
                    clicks: 0,
                  });
                }}
                className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Deal
              </button>
              </div>
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
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                          Image URL <span className="text-xs text-gray-500">(300x600px recommended)</span>
                        </label>
                        <input
                          type="url"
                          value={editingDeal?.image_url || ''}
                          onChange={(e) => setEditingDeal({ ...editingDeal!, image_url: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="https://..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload a 300x600px vertical banner image for best display</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Client</label>
                        <select
                          value={editingDeal?.client_id || ''}
                          onChange={(e) => setEditingDeal({ ...editingDeal!, client_id: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                        >
                          <option value="">No Client (Global Deal)</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
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
                deals
                  .filter(deal => selectedClientFilter === 'all' || deal.client_id === selectedClientFilter)
                  .map((deal) => (
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
                        className="w-16 h-32 object-cover rounded-xl"
                        style={{ aspectRatio: '300/600' }}
                      />
                    ) : (
                      <div className="w-16 h-32 bg-[var(--sage-light)] rounded-xl flex items-center justify-center" style={{ aspectRatio: '300/600' }}>
                        <Tag className="w-6 h-6 text-[var(--sage)]" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
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
                        {deal.client_id && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                            {clients.find(c => c.id === deal.client_id)?.name || 'Unknown Client'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--forest)]/60 line-clamp-1 mt-1">{deal.description}</p>

                      {/* Impressions & Clicks Stats */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--forest)]/60">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{deal.impressions || 0} impressions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{deal.clicks || 0} clicks</span>
                        </div>
                        {deal.impressions > 0 && (
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>{((deal.clicks || 0) / deal.impressions * 100).toFixed(1)}% CTR</span>
                          </div>
                        )}
                      </div>
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
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--forest)]">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--forest)]">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--forest)]">Zip</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--forest)]">Source</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--forest)]">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--forest)]">Klaviyo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--forest)]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--sage)]/10">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[var(--sage-light)]/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-[var(--sage)]" />
                              <span className="text-sm text-[var(--forest)]">{sub.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[var(--forest)]">{sub.first_name || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[var(--forest)]">{sub.zip_code || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            {sub.utm_source ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title={`${sub.utm_source}${sub.utm_medium ? ` / ${sub.utm_medium}` : ''}${sub.utm_campaign ? ` / ${sub.utm_campaign}` : ''}`}>
                                {sub.utm_source}
                              </span>
                            ) : sub.referrer ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600" title={sub.referrer}>
                                referral
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">direct</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--forest)]/60">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {sub.synced_klaviyo ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <span className="flex items-center gap-1">
                                <X className="w-5 h-5 text-gray-300" />
                                {!sub.landing_page_id && (
                                  <span className="text-xs text-orange-500" title="No landing page linked">⚠</span>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {!sub.synced_klaviyo && sub.landing_page_id && (
                                <button
                                  onClick={() => syncSubscriberToKlaviyo(sub.id)}
                                  disabled={syncingSubscriberId === sub.id}
                                  className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                                  title="Sync to Klaviyo"
                                >
                                  {syncingSubscriberId === sub.id ? (
                                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4 text-blue-500" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => deleteSubscriber(sub.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete subscriber"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-display text-2xl text-[var(--forest)]">Landing Pages</h2>
                <p className="text-sm text-[var(--forest)]/60 mt-1">
                  Create and manage landing pages for each client
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Client Filter */}
                <select
                  value={selectedClientFilter}
                  onChange={(e) => setSelectedClientFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)] bg-white"
                >
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.is_default ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (clients.length === 0) {
                      showMessage('error', 'Create a client first before adding landing pages');
                      return;
                    }
                    const defaultClient = clients.find(c => c.is_default) || clients[0];
                    setIsCreatingPage(true);
                    setEditingPage({
                      name: '',
                      slug: '',
                      background_image: null,
                      background_color: '#1a1a2e',
                      video_url: null,
                      headline: 'Exclusive Green Lifestyle Deals',
                      subheadline: 'Join our exclusive list for premium wellness deals.',
                      button_text: 'Get Exclusive Deals',
                      theme: 'light',
                      custom_css: null,
                      active: true,
                      traffic_weight: 100,
                      views: 0,
                      conversions: 0,
                      collect_first_name: false,
                      is_homepage: false,
                      client_id: selectedClientFilter !== 'all' ? selectedClientFilter : defaultClient?.id || null,
                      klaviyo_list_id: null,
                      show_logo: false,
                      logo_url: null,
                      thank_you_page_id: null,
                    });
                  }}
                  className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Landing Page
                </button>
              </div>
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

                      {/* Video Upload Section */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                          <Video className="w-4 h-4 inline mr-1" /> Landing Page Video (YouTube-style)
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingPage?.video_url || ''}
                              onChange={(e) => setEditingPage({ ...editingPage!, video_url: e.target.value || null })}
                              className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                              placeholder="Select or upload a video..."
                            />
                            <button
                              type="button"
                              onClick={() => setShowVideoSelector(true)}
                              className="px-4 py-3 rounded-xl bg-[var(--sage-light)] hover:bg-[var(--sage)]/30 text-[var(--forest)] flex items-center gap-2"
                            >
                              <Play className="w-5 h-5" />
                              Browse
                            </button>
                          </div>
                          {editingPage?.video_url && (
                            <div className="relative w-48 h-28 rounded-lg overflow-hidden border-2 border-[var(--sage)]/30 bg-black">
                              <video
                                src={editingPage.video_url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-8 h-8 text-white" />
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingPage({ ...editingPage!, video_url: null })}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Video Selector Modal */}
                      <AnimatePresence>
                        {showVideoSelector && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
                            onClick={() => setShowVideoSelector(false)}
                          >
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="font-display text-xl text-[var(--forest)]">Select Landing Page Video</h3>
                                <button
                                  onClick={() => setShowVideoSelector(false)}
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
                                    {uploadingVideo ? 'Uploading...' : 'Click to upload new video (max 100MB)'}
                                  </span>
                                  <span className="text-xs text-[var(--forest)]/50 mt-1">
                                    Supported: MP4, WebM, MOV
                                  </span>
                                  <input
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime"
                                    className="hidden"
                                    disabled={uploadingVideo}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = await uploadVideo(file);
                                        if (url) {
                                          selectVideo(url);
                                        }
                                      }
                                    }}
                                  />
                                </label>
                              </div>

                              {/* Uploaded Videos */}
                              {uploadedVideos.length > 0 ? (
                                <div>
                                  <h4 className="text-sm font-medium text-[var(--forest)]/70 mb-2">Uploaded Videos</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    {uploadedVideos.map((vid) => (
                                      <div key={vid.name} className="relative group">
                                        <button
                                          onClick={() => selectVideo(vid.url)}
                                          className="relative aspect-video rounded-lg overflow-hidden border-2 border-[var(--sage)]/30 hover:border-[var(--primary)] transition-colors w-full bg-black"
                                        >
                                          <video src={vid.url} className="w-full h-full object-cover" muted playsInline />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <Play className="w-8 h-8 text-white" />
                                          </div>
                                        </button>
                                        <button
                                          onClick={() => deleteVideo(vid.name)}
                                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-[var(--forest)]/50 py-8">
                                  No videos uploaded yet. Upload your first video above.
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
                          Active (visible to visitors)
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

                      {/* Show Logo Option */}
                      <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="show-logo"
                            checked={editingPage?.show_logo ?? false}
                            onChange={(e) => setEditingPage({ ...editingPage!, show_logo: e.target.checked })}
                            className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                          />
                          <div className="flex-1">
                            <label htmlFor="show-logo" className="text-sm font-medium text-purple-900 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Show Logo
                            </label>
                            <p className="text-xs text-purple-700 mt-1">
                              Display a logo at the top of this landing page
                            </p>
                          </div>
                        </div>

                        {/* Logo Upload */}
                        {editingPage?.show_logo && (
                          <div className="pt-3 border-t border-purple-200">
                            <label className="block text-sm font-medium text-purple-900 mb-2">
                              Logo Image
                            </label>
                            {editingPage.logo_url && (
                              <div className="mb-3 p-2 bg-white rounded-lg inline-block">
                                <img
                                  src={editingPage.logo_url}
                                  alt="Logo preview"
                                  className="h-12 w-auto object-contain"
                                />
                              </div>
                            )}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingPage.logo_url || ''}
                                onChange={(e) => setEditingPage({ ...editingPage!, logo_url: e.target.value || null })}
                                placeholder="https://... or upload below"
                                className="flex-1 px-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-400 text-sm"
                              />
                            </div>
                            <div className="mt-2">
                              <input
                                type="file"
                                accept="image/*,.gif"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const formData = new FormData();
                                  formData.append('file', file);

                                  try {
                                    const res = await fetch('/api/images', {
                                      method: 'POST',
                                      body: formData,
                                    });
                                    const data = await res.json();
                                    if (data.url) {
                                      setEditingPage({ ...editingPage!, logo_url: data.url });
                                    }
                                  } catch (err) {
                                    console.error('Logo upload failed:', err);
                                  }
                                }}
                                className="text-sm text-purple-700"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Thank You Page Selection */}
                      <div className="p-4 bg-pink-50 rounded-xl">
                        <label className="block text-sm font-medium text-pink-900 mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Thank You Page
                        </label>
                        <select
                          value={editingPage?.thank_you_page_id || ''}
                          onChange={(e) => setEditingPage({ ...editingPage!, thank_you_page_id: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 bg-white"
                        >
                          <option value="">Default thank you page</option>
                          {thankYouPages.filter(tp => tp.active).map((tp) => (
                            <option key={tp.id} value={tp.id}>{tp.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-pink-700 mt-1">
                          Redirect users to this page after form submission
                        </p>
                      </div>

                      {/* Client Selection */}
                      <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                            Client <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editingPage?.client_id || ''}
                            onChange={(e) => {
                              setEditingPage({
                                ...editingPage!,
                                client_id: e.target.value || null,
                                klaviyo_list_id: null // Reset list when client changes
                              });
                            }}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)] bg-white"
                            required
                          >
                            <option value="">Select a client...</option>
                            {clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.name} {client.is_default ? '(Default)' : ''} {client.klaviyo_api_key ? '' : '(No API key)'}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-[var(--forest)]/50 mt-1">
                            Each landing page belongs to a client
                          </p>
                        </div>

                        {/* Klaviyo List Selection */}
                        {editingPage?.client_id && (
                          <div>
                            <label className="block text-sm font-medium text-[var(--forest)] mb-1">
                              Klaviyo List
                            </label>
                            {loadingPageLists ? (
                              <div className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 bg-white flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                                <span className="text-sm text-[var(--forest)]/60">Loading lists...</span>
                              </div>
                            ) : pageLists.length > 0 ? (
                              <select
                                value={editingPage?.klaviyo_list_id || ''}
                                onChange={(e) => setEditingPage({ ...editingPage!, klaviyo_list_id: e.target.value || null })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)] bg-white"
                              >
                                <option value="">Select a list...</option>
                                {pageLists.map((list) => (
                                  <option key={list.id} value={list.id}>
                                    {list.name} ({list.id})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 text-sm">
                                {clients.find(c => c.id === editingPage.client_id)?.klaviyo_api_key
                                  ? 'No lists found for this client'
                                  : 'Client has no Klaviyo API key configured'}
                              </div>
                            )}
                            {editingPage?.klaviyo_list_id && (
                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Subscribers will sync to: {editingPage.klaviyo_list_id}
                              </p>
                            )}
                          </div>
                        )}
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
              {(() => {
                const filteredPages = selectedClientFilter === 'all'
                  ? landingPages
                  : landingPages.filter(p => p.client_id === selectedClientFilter);

                if (filteredPages.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-2xl">
                      <Layers className="w-12 h-12 text-[var(--sage)] mx-auto mb-4" />
                      <p className="text-[var(--forest)]/60">
                        {selectedClientFilter === 'all'
                          ? 'No landing pages yet. Create your first variant!'
                          : `No landing pages for this client. Create one!`}
                      </p>
                    </div>
                  );
                }

                return filteredPages.map((page) => {
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
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Preview page"
                          >
                            <ExternalLink className="w-5 h-5 text-blue-600" />
                          </a>
                          <button
                            onClick={() => setEditingPage(page)}
                            className="p-2 hover:bg-[var(--sage-light)] rounded-lg transition-colors"
                            title="Edit page"
                          >
                            <Edit2 className="w-5 h-5 text-[var(--forest)]" />
                          </button>
                          <button
                            onClick={() => page.id && resetLandingPageStats(page.id)}
                            className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                            title="Reset stats"
                          >
                            <RefreshCw className="w-5 h-5 text-orange-500" />
                          </button>
                          <button
                            onClick={() => page.id && deleteLandingPage(page.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete page"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Thank You Pages Tab */}
        {activeTab === 'thank-you-pages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-[var(--forest)]">Thank You Pages</h2>
              <button
                onClick={() => {
                  setIsCreatingThankYouPage(true);
                  setEditingThankYouPage({
                    name: '',
                    slug: '',
                    client_id: null,
                    headline: 'Thank You!',
                    subheadline: 'Your submission has been received.',
                    body_text: null,
                    background_image: null,
                    background_color: '#1a1a2e',
                    video_url: null,
                    theme: 'dark',
                    custom_css: null,
                    show_logo: true,
                    cta_text: null,
                    cta_url: null,
                    cta_style: 'primary',
                    active: true,
                  });
                }}
                className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Thank You Page
              </button>
            </div>

            <p className="text-sm text-[var(--forest)]/70">
              Create thank you pages to show after form submissions. Link them to landing pages for a complete funnel.
            </p>

            {/* Thank You Page Editor Modal */}
            <AnimatePresence>
              {(editingThankYouPage || isCreatingThankYouPage) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                  onClick={() => {
                    setEditingThankYouPage(null);
                    setIsCreatingThankYouPage(false);
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-xl text-[var(--forest)]">
                        {editingThankYouPage?.id ? 'Edit Thank You Page' : 'Create Thank You Page'}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingThankYouPage(null);
                          setIsCreatingThankYouPage(false);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Page Name</label>
                          <input
                            type="text"
                            value={editingThankYouPage?.name || ''}
                            onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                            placeholder="e.g., Main Thank You"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Slug</label>
                          <input
                            type="text"
                            value={editingThankYouPage?.slug || ''}
                            onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                            placeholder="e.g., main-thank-you"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Client</label>
                        <select
                          value={editingThankYouPage?.client_id || ''}
                          onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, client_id: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                        >
                          <option value="">No client</option>
                          {clients.filter(c => c.active).map((client) => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Headline</label>
                        <input
                          type="text"
                          value={editingThankYouPage?.headline || ''}
                          onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, headline: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="Thank You!"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Subheadline</label>
                        <input
                          type="text"
                          value={editingThankYouPage?.subheadline || ''}
                          onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, subheadline: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="Your submission has been received."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Body Text (optional)</label>
                        <textarea
                          value={editingThankYouPage?.body_text || ''}
                          onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, body_text: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          rows={3}
                          placeholder="Additional message or instructions..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Theme</label>
                          <select
                            value={editingThankYouPage?.theme || 'dark'}
                            onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, theme: e.target.value as 'light' | 'dark' })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--forest)] mb-1">Background Color</label>
                          <input
                            type="color"
                            value={editingThankYouPage?.background_color || '#1a1a2e'}
                            onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, background_color: e.target.value })}
                            className="w-full h-12 rounded-xl border-2 border-[var(--sage)]/30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Background Image URL</label>
                        <input
                          type="text"
                          value={editingThankYouPage?.background_image || ''}
                          onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, background_image: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Video URL (optional)</label>
                        <input
                          type="text"
                          value={editingThankYouPage?.video_url || ''}
                          onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, video_url: e.target.value || null })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="font-medium text-[var(--forest)] mb-3">CTA Button (optional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--forest)] mb-1">Button Text</label>
                            <input
                              type="text"
                              value={editingThankYouPage?.cta_text || ''}
                              onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, cta_text: e.target.value || null })}
                              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                              placeholder="e.g., View Deals"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--forest)] mb-1">Button URL</label>
                            <input
                              type="text"
                              value={editingThankYouPage?.cta_url || ''}
                              onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, cta_url: e.target.value || null })}
                              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingThankYouPage?.show_logo ?? true}
                            onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, show_logo: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--sage)] text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-sm font-medium text-[var(--forest)]">Show Client Logo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingThankYouPage?.active ?? true}
                            onChange={(e) => setEditingThankYouPage({ ...editingThankYouPage!, active: e.target.checked })}
                            className="w-5 h-5 rounded border-[var(--sage)] text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-sm font-medium text-[var(--forest)]">Active</span>
                        </label>
                      </div>

                      <button
                        onClick={async () => {
                          if (!editingThankYouPage?.name || !editingThankYouPage?.slug) {
                            showMessage('error', 'Name and slug are required');
                            return;
                          }
                          setLoading(true);
                          try {
                            const response = await fetch('/api/thank-you-pages', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${authToken}`,
                              },
                              body: JSON.stringify(editingThankYouPage),
                            });
                            if (response.ok) {
                              showMessage('success', editingThankYouPage.id ? 'Page updated!' : 'Page created!');
                              setEditingThankYouPage(null);
                              setIsCreatingThankYouPage(false);
                              loadData(authToken);
                            } else {
                              showMessage('error', 'Failed to save page');
                            }
                          } catch {
                            showMessage('error', 'Failed to save page');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Page
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thank You Pages List */}
            <div className="grid gap-4">
              {thankYouPages.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <Heart className="w-12 h-12 text-[var(--sage)] mx-auto mb-4" />
                  <p className="text-[var(--forest)]/60">No thank you pages yet. Create your first one!</p>
                </div>
              ) : (
                thankYouPages.map((page) => {
                  const client = clients.find(c => c.id === page.client_id);
                  const linkedLandingPages = landingPages.filter(lp => lp.thank_you_page_id === page.id);
                  return (
                    <div
                      key={page.id}
                      className={`bg-white rounded-2xl p-5 ${!page.active ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-pink-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-[var(--forest)]">{page.name}</h3>
                            <span className="text-xs text-[var(--forest)]/50">/{page.slug}</span>
                            {!page.active && (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">Inactive</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[var(--forest)]/60">
                            <span>{client?.name || 'No client'}</span>
                            <span className="text-[var(--forest)]/40">|</span>
                            <span>{linkedLandingPages.length} linked landing page{linkedLandingPages.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/thank-you/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-[var(--sage-light)] rounded-lg transition-colors"
                            title="Preview"
                          >
                            <ExternalLink className="w-5 h-5 text-[var(--forest)]" />
                          </a>
                          <button
                            onClick={() => setEditingThankYouPage(page)}
                            className="p-2 hover:bg-[var(--sage-light)] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-5 h-5 text-[var(--forest)]" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Delete this thank you page?')) return;
                              try {
                                const response = await fetch(`/api/thank-you-pages?id=${page.id}`, {
                                  method: 'DELETE',
                                  headers: { Authorization: `Bearer ${authToken}` },
                                });
                                if (response.ok) {
                                  showMessage('success', 'Page deleted!');
                                  loadData(authToken);
                                }
                              } catch {
                                showMessage('error', 'Failed to delete page');
                              }
                            }}
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

        {/* Media Library Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-[var(--forest)]">Media Library</h2>
            </div>

            <p className="text-sm text-[var(--forest)]/70">
              Upload and manage images and videos for each client. Media is organized by client for easy access when building pages.
            </p>

            {/* Client Selector */}
            <div className="bg-white rounded-2xl p-5">
              <label className="block text-sm font-medium text-[var(--forest)] mb-2">Select Client</label>
              <select
                value={selectedMediaClient}
                onChange={(e) => {
                  setSelectedMediaClient(e.target.value);
                  if (e.target.value) {
                    // Load media for this client
                    fetch(`/api/client-media?client_id=${e.target.value}`, {
                      headers: { Authorization: `Bearer ${authToken}` },
                    })
                      .then(res => res.json())
                      .then(data => setClientMedia(data.media || []))
                      .catch(() => setClientMedia([]));
                  } else {
                    setClientMedia([]);
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {selectedMediaClient && (
              <>
                {/* Upload Section */}
                <div className="bg-white rounded-2xl p-5">
                  <h3 className="font-medium text-[var(--forest)] mb-4">Upload Media</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--forest)] mb-1">Folder</label>
                      <select
                        value={mediaFolder}
                        onChange={(e) => setMediaFolder(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-[var(--sage)]/30 focus:border-[var(--primary)]"
                      >
                        <option value="general">General</option>
                        <option value="landing">Landing Pages</option>
                        <option value="thankyou">Thank You Pages</option>
                        <option value="logo">Logos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--forest)] mb-1">Upload File</label>
                      <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--sage-light)] hover:bg-[var(--sage)] rounded-xl cursor-pointer transition-colors">
                        {uploadingMedia ? (
                          <div className="w-5 h-5 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Choose File
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,video/*,.gif"
                          className="hidden"
                          disabled={uploadingMedia}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const client = clients.find(c => c.id === selectedMediaClient);
                            if (!client) return;

                            setUploadingMedia(true);
                            try {
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('client_id', selectedMediaClient);
                              formData.append('client_slug', client.slug);
                              formData.append('folder', mediaFolder);

                              const response = await fetch('/api/client-media', {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${authToken}` },
                                body: formData,
                              });

                              if (response.ok) {
                                showMessage('success', 'Media uploaded!');
                                // Reload media
                                const mediaRes = await fetch(`/api/client-media?client_id=${selectedMediaClient}`, {
                                  headers: { Authorization: `Bearer ${authToken}` },
                                });
                                const data = await mediaRes.json();
                                setClientMedia(data.media || []);
                              } else {
                                const error = await response.json();
                                showMessage('error', error.error || 'Failed to upload');
                              }
                            } catch {
                              showMessage('error', 'Failed to upload media');
                            } finally {
                              setUploadingMedia(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Media Grid */}
                <div className="bg-white rounded-2xl p-5">
                  <h3 className="font-medium text-[var(--forest)] mb-4">
                    Media Files ({clientMedia.length})
                  </h3>
                  {clientMedia.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderOpen className="w-12 h-12 text-[var(--sage)] mx-auto mb-4" />
                      <p className="text-[var(--forest)]/60">No media uploaded yet for this client.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {clientMedia.map((media) => (
                        <div key={media.id} className="relative group">
                          <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                            {media.file_type === 'video' || media.file_type === 'gif' ? (
                              <video
                                src={media.file_url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                              />
                            ) : (
                              <img
                                src={media.file_url}
                                alt={media.file_name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(media.file_url);
                                showMessage('success', 'URL copied!');
                              }}
                              className="p-2 bg-white rounded-lg hover:bg-gray-100"
                              title="Copy URL"
                            >
                              <Link2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this file?')) return;
                                try {
                                  const response = await fetch(`/api/client-media?id=${media.id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${authToken}` },
                                  });
                                  if (response.ok) {
                                    showMessage('success', 'File deleted!');
                                    setClientMedia(clientMedia.filter(m => m.id !== media.id));
                                  }
                                } catch {
                                  showMessage('error', 'Failed to delete');
                                }
                              }}
                              className="p-2 bg-white rounded-lg hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <p className="text-xs text-[var(--forest)]/60 mt-1 truncate">{media.file_name}</p>
                          <p className="text-xs text-[var(--forest)]/40">{media.folder}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
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
                    logo_url: null,
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
                        <label className="block text-sm font-medium text-[var(--forest)] mb-1">Client Logo</label>
                        <p className="text-xs text-[var(--forest)]/50 mb-2">
                          Upload a GIF, video, or image for the client logo
                        </p>

                        {editingClient?.logo_url ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100 border-2 border-[var(--sage)]/30">
                              {editingClient.logo_url.match(/\.(mp4|webm|mov)$/i) ? (
                                <video
                                  src={editingClient.logo_url}
                                  className="w-full h-full object-contain"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                />
                              ) : (
                                <img
                                  src={editingClient.logo_url}
                                  alt="Client logo"
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--sage-light)] hover:bg-[var(--sage)] text-[var(--forest)] rounded-xl cursor-pointer transition-colors">
                                <Upload className="w-4 h-4" />
                                Change Logo
                                <input
                                  type="file"
                                  accept="image/*,video/mp4,video/webm,video/quicktime,.gif"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadClientLogo(file);
                                  }}
                                  disabled={uploadingLogo}
                                />
                              </label>
                              <button
                                onClick={removeClientLogo}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[var(--sage)] hover:border-[var(--primary)] bg-[var(--sage-light)]/50 cursor-pointer transition-colors">
                            {uploadingLogo ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-3 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
                                <span className="text-sm text-[var(--forest)]/60">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-[var(--forest)]/40 mb-2" />
                                <span className="text-sm text-[var(--forest)]/60">Click to upload logo</span>
                                <span className="text-xs text-[var(--forest)]/40 mt-1">GIF, MP4, PNG, JPG, SVG</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,video/mp4,video/webm,video/quicktime,.gif"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadClientLogo(file);
                              }}
                              disabled={uploadingLogo}
                            />
                          </label>
                        )}
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
                    className={`bg-white rounded-2xl p-5 ${
                      client.is_default ? 'ring-2 ring-[var(--primary)]' : ''
                    } ${!client.active ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${
                        client.is_default ? 'bg-[var(--primary)] text-white' : 'bg-indigo-100'
                      } ${client.logo_url ? 'p-0' : ''}`}>
                        {client.logo_url ? (
                          client.logo_url.match(/\.(mp4|webm|mov)$/i) ? (
                            <video
                              src={client.logo_url}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={client.logo_url}
                              alt={client.name}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <Users className={`w-6 h-6 ${client.is_default ? 'text-white' : 'text-indigo-600'}`} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[var(--forest)]">{client.name}</h3>
                          <span className="text-xs text-[var(--forest)]/50">/{client.slug}</span>
                          {client.is_default && (
                            <span className="px-2 py-1 text-xs rounded-full bg-[var(--primary)] text-white">
                              Default
                            </span>
                          )}
                          {!client.active && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[var(--forest)]/60">
                          {client.klaviyo_api_key ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              API Key configured
                            </span>
                          ) : (
                            <span className="text-amber-600">No API key</span>
                          )}
                          <span className="text-[var(--forest)]/40">|</span>
                          <span>{landingPages.filter(p => p.client_id === client.id).length} landing pages</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!client.is_default && (
                          <button
                            onClick={() => client.id && setDefaultClientAction(client.id)}
                            className="px-3 py-2 text-xs font-medium hover:bg-[var(--sage-light)] rounded-lg transition-colors text-[var(--primary)]"
                            title="Set as default client for homepage"
                          >
                            Set Default
                          </button>
                        )}
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

        {/* Debug Panel */}
        {showDebugPanel && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-green-400 font-mono text-xs max-h-64 overflow-auto z-50 border-t-2 border-green-500">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 sticky top-0">
              <div className="flex items-center gap-4">
                <span className="text-white font-bold">Debug Console</span>
                <button
                  onClick={fetchDebugInfo}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-500"
                >
                  Fetch Debug Info
                </button>
                <button
                  onClick={() => setDebugLog([])}
                  className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={() => setShowDebugPanel(false)}
                className="text-white hover:text-red-400"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-1">
              {debugLog.length === 0 ? (
                <div className="text-gray-500">No logs yet. Click sync on a subscriber to see output.</div>
              ) : (
                debugLog.map((log, i) => (
                  <pre key={i} className="whitespace-pre-wrap break-all">{log}</pre>
                ))
              )}
            </div>
          </div>
        )}

        {/* Debug Toggle Button */}
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="fixed bottom-4 right-4 bg-gray-800 text-green-400 px-3 py-2 rounded-lg text-xs font-mono z-40 hover:bg-gray-700"
        >
          {showDebugPanel ? '🔽 Hide Debug' : '🔼 Show Debug'}
        </button>
      </div>
    </div>
  );
}
