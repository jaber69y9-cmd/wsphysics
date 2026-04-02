import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { showAlert } from '../../utils/alert';
import { useAuth } from '../../context/AuthContext';

export function Settings() {
  const { settings, refreshSettings } = useSettings();
  const { token } = useAuth();
  const [siteName, setSiteName] = useState(settings.site_name || '');

  useEffect(() => {
    setSiteName(settings.site_name || '');
  }, [settings]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: 'site_name', value: siteName })
      });
      if (res.ok) {
        await refreshSettings();
        showAlert('Settings updated successfully', 'success');
      } else {
        showAlert('Failed to update settings', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('An error occurred', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">Manage website settings and moderators.</p>
      </div>
      <GlassCard className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <SettingsIcon className="w-8 h-8 text-orange-600" />
          <h2 className="text-xl font-bold">General Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              placeholder="Enter site name"
            />
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-700 transition-all"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
