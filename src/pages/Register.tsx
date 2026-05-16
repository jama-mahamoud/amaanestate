import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
         await setDoc(userRef, {
           email: result.user.email,
           name: result.user.displayName || 'Anonymous',
           role: 'agent', // Explicitly registering as an agent
           isApproved: false, // Must be approved by admin
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp(),
         });
         toast.success("Agent application submitted successfully!");
      } else {
         toast.info("Account already exists. Logged you in.");
      }
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-gold text-black w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl mb-4">
            AE
          </div>
          <CardTitle className="text-3xl font-bold">Register as Agent</CardTitle>
          <CardDescription>
            Join the elite brokers of AmaanEstate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center mb-6">
            Sign up with your Google account. Your application will be reviewed by an administrator before you can list properties or vehicles.
          </p>
          <Button 
            className="w-full h-12 text-md transition-all font-semibold bg-amber-500 hover:bg-black text-white" 
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Register with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500 border-t pt-6">
          Already have an account? <Link to="/login" className="ml-1 text-black font-semibold hover:underline">Sign in</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
