import { useState, useEffect } from 'react';
import { useAuth } from '../../components/providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DashboardUsers() {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [appUser]);

  const toggleApproval = async (id: string, currentApproval: boolean, role: string) => {
    try {
      await updateDoc(doc(db, 'users', id), {
        isApproved: !currentApproval,
        updatedAt: serverTimestamp()
      });
      toast.success('Agent status updated');
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to update agent status');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Agents & Users</h1>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Name / Email</th>
              <th className="px-6 py-4 font-medium text-gray-500">Role</th>
              <th className="px-6 py-4 font-medium text-gray-500">Approval Status</th>
              <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                     <div className="font-medium">{user.name}</div>
                     <div className="text-gray-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-semibold">{user.role}</td>
                  <td className="px-6 py-4">
                    {user.role === 'agent' ? (
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    ) : (
                       <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {user.role === 'agent' && (
                       <Button size="sm" variant={user.isApproved ? 'outline' : 'default'} className={!user.isApproved ? "bg-amber-500 hover:bg-amber-600 focus:bg-amber-600 text-white" : ""} onClick={() => toggleApproval(user.id, user.isApproved, user.role)}>
                         {user.isApproved ? 'Revoke Approval' : 'Approve Agent'}
                       </Button>
                    )}
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
