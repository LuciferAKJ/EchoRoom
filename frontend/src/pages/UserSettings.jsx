import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Sparkles, Shield, RefreshCw, Key } from 'lucide-react';

export const UserSettings = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-echo-border/60">
        <h1 className="text-2xl font-serif font-bold text-echo-text">Identity & Settings</h1>
        <p className="text-xs text-echo-muted mt-1">
          Manage your anonymous persona, account credentials, and privacy preferences.
        </p>
      </div>

      {/* Anonymous Identity Customization */}
      <Card padding="lg" className="space-y-4">
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle>Anonymous Display Persona</CardTitle>
          <CardDescription>
            This pseudonym is displayed publicly when you post thoughts or chat in rooms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-echo-lavender/20 border border-echo-lavender/40 flex items-center justify-center text-echo-lavender text-base font-bold">
              Q
            </div>
            <div className="flex-1">
              <Input label="Display Pseudonym" defaultValue="Quiet Wanderer" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" size="sm" icon={RefreshCw}>
              Generate New Pseudonym
            </Button>
            <Button size="sm">Save Persona</Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card padding="lg" className="space-y-4">
        <CardHeader className="flex-col items-start gap-1">
          <CardTitle>Private Account Security</CardTitle>
          <CardDescription>
            Your email is never shown publicly or attached to your public thoughts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Email Address" defaultValue="user@example.com" disabled />
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="secondary" icon={Key}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;

