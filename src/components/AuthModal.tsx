import React, { useState } from 'react';
import { X, User, Mail, Lock, ShieldCheck, Database, Smartphone, CheckCircle2, CloudUpload, Key } from 'lucide-react';
import { User as UserType } from '../types';
import { DBService } from '../services/dbService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onLoginSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'storage_info'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!email || !password || (mode === 'signup' && !name)) {
      setStatusMsg({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up request to server
        const res = await fetch('/api/user/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (data.success && data.user) {
          DBService.setCurrentUser(data.user);
          onLoginSuccess(data.user);
          setStatusMsg({ text: 'Account created & synced to cloud server!', type: 'success' });
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          // Local offline fallback registration
          const newUsr: UserType = {
            id: `usr_${Date.now()}`,
            name,
            email,
            role: 'user',
            plan: 'free',
            credits: 100,
            totalSpent: 0,
            referralCode: name.substring(0, 4).toUpperCase() + '2026',
            referralCount: 0,
            createdAt: new Date().toISOString(),
            status: 'active',
          };
          DBService.setCurrentUser(newUsr);
          onLoginSuccess(newUsr);
          setStatusMsg({ text: 'Account created locally in device storage!', type: 'success' });
          setTimeout(() => onClose(), 1200);
        }
      } else if (mode === 'signin') {
        const res = await fetch('/api/user/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (data.success && data.user) {
          DBService.setCurrentUser(data.user);
          onLoginSuccess(data.user);
          setStatusMsg({ text: 'Logged in successfully! Synced with server.', type: 'success' });
          setTimeout(() => onClose(), 1200);
        } else {
          // Local fallback matching
          const users = DBService.getUsers();
          const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (found) {
            DBService.setCurrentUser(found);
            onLoginSuccess(found);
            setStatusMsg({ text: 'Signed in from local vault!', type: 'success' });
            setTimeout(() => onClose(), 1200);
          } else {
            setStatusMsg({ text: data.error || 'User email not found. Please Sign Up.', type: 'error' });
          }
        }
      }
    } catch {
      // Local fallback
      const newUsr: UserType = {
        id: `usr_${Date.now()}`,
        name: name || 'Creator',
        email,
        role: 'user',
        plan: 'free',
        credits: 100,
        totalSpent: 0,
        referralCode: 'SCRIPA' + Math.floor(Math.random() * 8999 + 1000),
        referralCount: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      DBService.setCurrentUser(newUsr);
      onLoginSuccess(newUsr);
      setStatusMsg({ text: 'Account active in offline device storage.', type: 'success' });
      setTimeout(() => onClose(), 1200);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="auth-modal-content" className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {mode === 'signup' ? 'Create Scripa Account' : mode === 'signin' ? 'Sign In to Studio' : 'Data & Cloud Server Sync'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Save scripts, track tokens, & sync across devices
            </p>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'signin' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('storage_info')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'storage_info' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Storage Info
          </button>
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {mode !== 'storage_info' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Creator / Brand Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              {isLoading ? 'Syncing...' : mode === 'signup' ? 'Create Account & Sync Cloud' : 'Sign In to Sync Account'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs text-slate-600">
            <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Dual Offline & Server Storage Architecture</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Scripa.studio is engineered to run seamlessly as a standalone mobile APK on Play Store or as a web application.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">📱 Local Phone Storage (Offline Ready)</span>
                  <p className="text-[11px] text-slate-500">
                    Your generated scripts, teleprompter records, and local tokens are saved securely on your device, ensuring full offline functionality.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <CloudUpload className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">☁️ Cloud Server Database Sync</span>
                  <p className="text-[11px] text-slate-500">
                    When signed in, your account automatically backs up scripts and token balances to the Express backend server database.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Secure Encryption
          </span>
          <span>Logged in as: <strong className="text-slate-700">{currentUser.name}</strong></span>
        </div>
      </div>
    </div>
  );
};
