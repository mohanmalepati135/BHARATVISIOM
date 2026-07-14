import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageParts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Label } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface Settings {
  platformName: string;
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data.settings));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setLoading(true);
    try {
      await api.patch('/settings', settings);
      notify('Settings saved.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <PageHeader title="Settings" />;

  return (
    <div>
      <PageHeader title="Settings" description="Platform-wide configuration for BharatVision." />
      <div className="max-w-xl p-8">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic platform configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platformName">Platform name</Label>
              <Input id="platformName" value={settings.platformName} onChange={(e) => setSettings({ ...settings, platformName: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input id="contactEmail" type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={settings.allowRegistrations}
                onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
              />
              Allow new participant registrations
            </label>
            <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              Maintenance mode
            </label>
            <Button onClick={handleSave} loading={loading}>
              Save settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
