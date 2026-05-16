import { useState, useEffect } from 'react';
import { useAuth } from '../../components/providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, ExternalLink } from 'lucide-react';

export default function DashboardProperties() {
  const { appUser } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'house',
    listingType: 'sale',
    price: '',
    location: '',
    city: 'Jigjiga',
    bedrooms: '0',
    bathrooms: '0',
    area: '0',
  });

  const fetchProperties = async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      let q;
      if (appUser.role === 'admin') {
        q = collection(db, 'properties'); // Admin sees all
      } else {
        q = query(collection(db, 'properties'), where('agentId', '==', appUser.uid));
      }
      
      const snap = await getDocs(q);
      setProperties(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      toast.error('Error fetching properties: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [appUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;

    try {
      const propertyData = {
        agentId: appUser.uid,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        listingType: formData.listingType,
        price: Number(formData.price),
        location: formData.location,
        city: formData.city,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        images: [],
        status: 'pending', // Default
        isFeatured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'properties'), propertyData);
      toast.success('Property created successfully');
      setIsDialogOpen(false);
      fetchProperties();
    } catch (err: any) {
      toast.error('Failed to create property: ' + err.message);
    }
  };

  const publishProperty = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'properties', id), {
        status: currentStatus === 'published' ? 'pending' : 'published',
        updatedAt: serverTimestamp()
      });
      toast.success('Status updated');
      fetchProperties();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const deleteProperty = async (id: string) => {
    if(!confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteDoc(doc(db, 'properties', id));
      toast.success('Property deleted');
      fetchProperties();
    } catch(err: any) {
      toast.error('Failed to delete property');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-black text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Property Listing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Title</Label>
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Luxury Villa in Jigjiga" />
                 </div>
                 <div className="space-y-2">
                    <Label>Price (ETB or USD)</Label>
                    <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="5000000" />
                 </div>
                 <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Listing Type</Label>
                    <Select value={formData.listingType} onValueChange={v => setFormData({...formData, listingType: v})}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={formData.city} onValueChange={v => setFormData({...formData, city: v})}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="Jigjiga">Jigjiga</SelectItem>
                          <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                          <SelectItem value="Godey">Godey</SelectItem>
                          <SelectItem value="Dhagahbur">Dhagahbur</SelectItem>
                          <SelectItem value="Kabridahar">Kabridahar</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Location / Address</Label>
                    <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Block 12, Main Street" />
                 </div>
                 <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Input type="number" value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} />
                 </div>
                 <div className="space-y-2 col-span-2">
                    <Label>Area (Sq.m)</Label>
                    <Input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                 </div>
                 <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="h-24" />
                 </div>
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-black text-white">Create Property</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Property</th>
              <th className="px-6 py-4 font-medium text-gray-500">Location</th>
              <th className="px-6 py-4 font-medium text-gray-500">Price</th>
              <th className="px-6 py-4 font-medium text-gray-500">Type</th>
              <th className="px-6 py-4 font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : properties.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center">No properties found.</td></tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{property.title}</td>
                  <td className="px-6 py-4">{property.city}</td>
                  <td className="px-6 py-4">{property.price.toLocaleString()}</td>
                  <td className="px-6 py-4 capitalize">{property.type} ({property.listingType})</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {appUser?.role === 'admin' && (
                       <Button size="sm" variant="outline" onClick={() => publishProperty(property.id, property.status)}>
                         {property.status === 'published' ? 'Unpublish' : 'Publish'}
                       </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => deleteProperty(property.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                       <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
