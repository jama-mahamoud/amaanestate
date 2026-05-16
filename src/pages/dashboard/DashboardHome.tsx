import { useAuth } from '../../components/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Car, Users, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function DashboardHome() {
  const { appUser } = useAuth();
  
  if (!appUser) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      {appUser.role === 'agent' && !appUser.isApproved && (
         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-4">
            <Clock className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Account Pending Approval</h3>
              <p>Your agent account is currently being reviewed by an administrator. You will not be able to publish listings until approved. You can still prepare listings in draft/pending state.</p>
            </div>
         </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Properties</CardTitle>
            <Home className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Vehicles</CardTitle>
            <Car className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Listings</CardTitle>
            <div className="w-4 h-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <Card className="border-0 shadow-sm">
            <CardHeader>
               <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-gray-500 text-sm">No recent activity.</p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
