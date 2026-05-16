import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../components/providers/AuthProvider';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function DashboardSettings() {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'AmaanEstate',
    contactEmail: 'contact@amaanestate.com',
    contactPhone: '+251 900 000 000',
    whatsappNumber: '+251900000000',
    address: 'Jigjiga, Somali Region, Ethiopia',
    facebook: '',
    twitter: '',
  });

  useEffect(() => {
    if (!appUser) {
      setLoading(false);
      return;
    }
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() });
        }
      } catch (err: any) {
         console.error('Error loading config:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [appUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      toast.success('Settings updated successfully');
    } catch (err: any) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Company Name</Label>
                   <Input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <Label>Contact Email</Label>
                   <Input type="email" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <Label>Contact Phone</Label>
                   <Input value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <Label>WhatsApp Number (without +)</Label>
                   <Input value={settings.whatsappNumber} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                   <Label>Address</Label>
                   <Textarea value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <Label>Facebook URL</Label>
                   <Input value={settings.facebook} onChange={e => setSettings({...settings, facebook: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <Label>Twitter URL</Label>
                   <Input value={settings.twitter} onChange={e => setSettings({...settings, twitter: e.target.value})} />
                </div>
             </div>
             <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-black text-white">
                {saving ? 'Saving...' : 'Save Settings'}
             </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}