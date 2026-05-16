import * as React from 'react';
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
import { Trash2, Edit, Plus } from 'lucide-react';
import { uploadImage } from '../../lib/upload';

export default function DashboardVehicles() {
  const { appUser } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const defaultForm = {
    title: '',
    description: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    listingType: 'sale',
    price: '',
    city: 'Jigjiga',
  };
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchVehicles = async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      let q = collection(db, 'vehicles');
      const snap = await getDocs(q);
      setVehicles(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    } catch (error: any) {
      toast.error('Error fetching vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [appUser]);

  const handleEditClick = (vehicle: any) => {
    setEditId(vehicle.id);
    setFormData({
      title: vehicle.title,
      description: vehicle.description,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      listingType: vehicle.listingType,
      price: vehicle.price.toString(),
      city: vehicle.city,
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditId(null);
    setFormData(defaultForm);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;
    setUploading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'vehicles');
      }

      if (editId) {
        const updateData: any = {
           title: formData.title,
           description: formData.description,
           make: formData.make,
           model: formData.model,
           year: Number(formData.year),
           listingType: formData.listingType,
           price: Number(formData.price),
           city: formData.city,
           updatedAt: serverTimestamp(),
        };
        if (imageUrl) {
           updateData.images = [imageUrl]; // override
        }
        await updateDoc(doc(db, 'vehicles', editId), updateData);
        toast.success('Vehicle updated successfully');
      } else {
        const vehicleData = {
          agentId: appUser.uid,
          title: formData.title,
          description: formData.description,
          make: formData.make,
          model: formData.model,
          year: Number(formData.year),
          listingType: formData.listingType,
          price: Number(formData.price),
          city: formData.city,
          images: imageUrl ? [imageUrl] : [],
          status: 'pending',
          isFeatured: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'vehicles'), vehicleData);
        toast.success('Vehicle created successfully');
      }

      setIsDialogOpen(false);
      setImageFile(null);
      setFormData(defaultForm);
      fetchVehicles();
    } catch (err: any) {
      toast.error('Failed to save vehicle: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const publishVehicle = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'vehicles', id), {
         status: currentStatus === 'published' ? 'pending' : 'published',
         updatedAt: serverTimestamp()
      });
      toast.success('Status updated');
      fetchVehicles();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const deleteVehicle = async (id: string) => {
    if(!confirm('Delete this vehicle?')) return;
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch(err: any) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-black text-white" onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Vehicle Listing' : 'Create New Vehicle Listing'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Title</Label>
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Toyota Land Cruiser 2022" />
                 </div>
                 <div className="space-y-2">
                    <Label>Price (ETB or USD)</Label>
                    <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="7000000" />
                 </div>
                 <div className="space-y-2">
                    <Label>Make</Label>
                    <Input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} placeholder="Toyota" />
                 </div>
                 <div className="space-y-2">
                    <Label>Model</Label>
                    <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Land Cruiser" />
                 </div>
                 <div className="space-y-2">
                    <Label>Year</Label>
                    <Input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2022" />
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
                    <Label>Image</Label>
                    <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                 </div>
                 <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="h-24" />
                 </div>
              </div>
              <Button type="submit" disabled={uploading} className="w-full bg-amber-500 hover:bg-black text-white">
                {uploading ? 'Uploading...' : (editId ? 'Update Vehicle' : 'Create Vehicle')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Vehicle</th>
              <th className="px-6 py-4 font-medium text-gray-500">City</th>
              <th className="px-6 py-4 font-medium text-gray-500">Price</th>
              <th className="px-6 py-4 font-medium text-gray-500">Make & Model</th>
              <th className="px-6 py-4 font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-4 text-center">No vehicles found.</td></tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                     {vehicle.images?.[0] && <img src={vehicle.images[0]} alt="" className="w-10 h-10 object-cover rounded" />}
                     {vehicle.title}
                  </td>
                  <td className="px-6 py-4">{vehicle.city}</td>
                  <td className="px-6 py-4">{vehicle.price.toLocaleString()}</td>
                  <td className="px-6 py-4">{vehicle.make} {vehicle.model} ({vehicle.year})</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => publishVehicle(vehicle.id, vehicle.status)}>
                      {vehicle.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditClick(vehicle)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                       <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteVehicle(vehicle.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
