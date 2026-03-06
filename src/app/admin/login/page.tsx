'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Welcome back!');
        router.push('/admin');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-[#1a1a1a] font-bold text-xl">TRD</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontSize: '1.5rem', lineHeight: '2rem', textTransform: 'none', fontFamily: 'system-ui, sans-serif' }}>
          Admin Dashboard
        </h1>
        <p className="text-white/50 text-sm">Sign in to manage your website</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-white/70 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
            placeholder="admin@trdremedial.com.au"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-white/70 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
            placeholder="Enter your password"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-[#1a1a1a] font-semibold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 text-sm"
          style={{ fontFamily: 'system-ui, sans-serif', textTransform: 'none' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
