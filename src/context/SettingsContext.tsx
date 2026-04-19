import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getFixedUrl } from '../lib/supabase';
import { SiteSettings } from '../types';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  loading: boolean;
  setupRequired: boolean;
}

const defaultSettings: SiteSettings = {
  id: 1,
  site_name: 'BestNigthVideos&Pics',
  site_description: 'A lightweight media app for downloading, viewing images and videos.',
  logo_url: '',
  favicon_url: '',
  categories: ['Nature', 'Gaming', 'Music', 'Sports', 'Education', 'Entertainment', 'News', 'Technology', 'Art', 'Vlog', 'Comedy', 'Travel'],
  contact_email: 'support@example.com',
  contact_phone: '+1 (555) 123-4567',
  twitter_url: '',
  telegram_url: ''
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Update document title and favicon
    document.title = settings.site_name;
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = getFixedUrl(settings.favicon_url);
    }
  }, [settings.site_name, settings.favicon_url]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (error) {
        if (error.code === '42P01') { // Table does not exist
          setSetupRequired(true);
        }
        console.error('Error fetching settings:', error);
        setSettings(defaultSettings);
      } else if (data) {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (err) {
      console.error('Unexpected error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...updated });
      if (error) {
        if (error.code === '42P01') {
          setSetupRequired(true);
          throw new Error('Settings table does not exist. Please run the setup SQL.');
        }
        throw error;
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, setupRequired }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
