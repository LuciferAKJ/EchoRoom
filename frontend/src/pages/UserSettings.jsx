import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Sparkles, Shield, RefreshCw, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export const UserSettings = () => {
  const { user, identity, updateIdentity, isAuthenticated } = useAuth();

  const [pseudonym, setPseudonym] = useState(identity?.pseudonym || '');
  const [bio, setBio] = useState(identity?.bio || '');
  const [avatarColor, setAvatarColor] = useState(identity?.avatarColor || '#b4a0e5');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (identity) {
      setPseudonym(identity.pseudonym || '');
      setBio(identity.bio || '');
      setAvatarColor(identity.avatarColor || '#b4a0e5');
    }
  }, [identity]);

  const handleGenerateRandom = async () => {
    try {
      const res = await api.get('/identity/random');
      if (res.data.success) {
        setPseudonym(res.data.data.pseudonym);
        setAvatarColor(res.data.data.avatarColor);
      }
    } catch (e) {
      // Fallback local random generator if offline
      const adj = ['Silent', 'Gentle', 'Kindred', 'Velvet', 'Midnight'][Math.floor(Math.random() * 5)];
      const noun = ['Echo', 'Voyager', 'Haven', 'Breeze', 'Sparrow'][Math.floor(Math.random() * 5)];
      setPseudonym(`${adj} ${noun} #${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleSaveIdentity = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);

    const res = await updateIdentity({ pseudonym, bio, avatarColor });
    setSaving(false);

    if (res.success) {
      setSuccessMsg('Anonymous persona updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to update persona.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-echo-text">Identity Settings</h2>
        <p className="text-xs text-echo-muted">
          Please log in to manage your anonymous persona and privacy settings.
        </p>
        <a href="/login" className="echo-btn-primary">
          Log In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-echo-border/60">
        <h1 className="text-2xl font-serif font-bold text-echo-text">Identity & Settings</h1>
        <p className="text-xs text-echo-muted mt-1">
          Customize your public anonymous persona and review account privacy.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-echo-emerald/15 border border-echo-emerald/30 flex items-center gap-2 text-xs text-echo-emerald">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-echo-rose/15 border border-echo-rose/30 flex items-center gap-2 text-xs text-echo-rose">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Anonymous Identity Customization */}
      <form onSubmit={handleSaveIdentity}>
        <Card padding="lg" className="space-y-4">
          <CardHeader className="flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-echo-lavender" />
              <CardTitle>Anonymous Display Persona</CardTitle>
            </div>
            <CardDescription>
              This is the only identity visible to other community members across thoughts, comments, and discussion rooms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-echo-bg text-lg font-bold shrink-0 shadow-subtle border-2 border-echo-border/80"
                style={{ backgroundColor: avatarColor }}
              >
                {pseudonym ? pseudonym.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex-1 w-full">
                <Input
                  label="Display Pseudonym"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="e.g. Quiet Wanderer #4821"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-echo-muted uppercase tracking-wider">
                Ephemeral Bio / Intention
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                placeholder="A gentle sentence describing your current state of mind..."
                className="echo-input resize-none"
              ></textarea>
              <p className="text-[10px] text-echo-subtle text-right">{bio.length}/160</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={handleGenerateRandom}
              >
                Generate New Suggestion
              </Button>
              <Button type="submit" size="sm" loading={saving}>
                Save Persona
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Account Security (Private) */}
      <Card padding="lg" className="space-y-4">
        <CardHeader className="flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-echo-periwinkle" />
            <CardTitle>Private Account Information</CardTitle>
          </div>
          <CardDescription>
            Your email is completely sequestered from public API queries. It is used exclusively for password resets and security notices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Registered Email (Private)"
            value={user?.email || 'user@example.com'}
            disabled
          />
          <div className="p-3 rounded-lg bg-echo-surface border border-echo-border/60 text-xs text-echo-subtle leading-relaxed">
            Your anonymous identity has no public linkage to this email address in search engines, feeds, or community databases.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
