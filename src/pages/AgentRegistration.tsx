import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../components/providers/AuthProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, UserCheck } from 'lucide-react';

export default function AgentRegistration() {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    experience: '',
    address: '',
  });

  if (!appUser) return <div className="p-12 text-center">Please login to apply as an agent.</div>;

  if (appUser.role === 'agent' || appUser.role === 'admin') {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <UserCheck className="w-16 h-16 text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">You are already an {appUser.role}!</h1>
        <p className="text-gray-500 mb-8">You have access to all agent features in your dashboard.</p>
        <Button onClick={() => window.location.href = '/dashboard'} className="bg-amber-500 hover:bg-black text-white">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', appUser.uid), {
        role: 'agent',
        isApproved: false, // Wait for admin
        agentProfile: {
          ...formData,
          appliedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
      toast.success('Application submitted! An admin will review your profile shortly.');
    } catch (error: any) {
      toast.error('Application failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-24 px-4">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-amber-500 w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Become an Agent</CardTitle>
          <CardDescription>Join the AmaanEstate network and start listing your properties and vehicles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Phone Number</label>
              <Input 
                required 
                placeholder="+251 ..." 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Office Address</label>
              <Input 
                required 
                placeholder="City, District, State" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Relevant Experience / About You</label>
              <Textarea 
                required 
                placeholder="Tell us about your experience in real estate or vehicle sales..." 
                className="min-h-[120px]"
                value={formData.experience}
                onChange={e => setFormData({...formData, experience: e.target.value})}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 text-lg bg-amber-500 hover:bg-black text-white transition-all"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
