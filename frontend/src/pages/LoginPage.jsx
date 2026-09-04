import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@careplus-hms.com', key: 'admin', icon: '👑', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { role: 'Doctor', email: 'dr.jenkins@careplus-hms.com', key: 'doctor', icon: '👨‍⚕️', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { role: 'Patient', email: 'patient@careplus-hms.com', key: 'patient', icon: '🩺', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { role: 'Receptionist', email: 'staff@careplus-hms.com', key: 'receptionist', icon: '📋', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' }
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoSelect = (acc) => {
    setEmail(acc.email);
    setPassword('demo12345');
    setSelectedRole(acc.key);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`Welcome back! Authenticated as ${selectedRole.toUpperCase()}. Redirecting...`);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Branding Side Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">CarePlus HMS</span>
            </Link>

            <div className="space-y-2 pt-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
                Secure Security Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Access Medical Dashboard & Records
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Log in to view OPD queues, digital prescriptions, EHR health summaries, and hospital administration metrics.
              </p>
            </div>
          </div>

          {/* Bottom Security Card */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3 relative z-10">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant & 256-bit Encrypted</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Role-based authorization prevents unauthorized data exposure across all medical departments.
            </p>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Sign In to Your Account</h3>
                <p className="text-xs text-slate-500 mt-1">Select a role or enter your credentials to continue</p>
              </div>
              <Link 
                to="/register" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>

            {/* Success Message Banner */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Demo Quick Role Accounts */}
            <div className="mb-6 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                ⚡ 1-Click Demo Accounts (Instant Fill)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.key}
                    type="button"
                    onClick={() => handleDemoSelect(acc)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all shadow-sm ${acc.color} ${
                      selectedRole === acc.key ? 'ring-2 ring-blue-500 font-bold' : ''
                    }`}
                  >
                    <span className="text-lg">{acc.icon}</span>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-tight">{acc.role}</p>
                      <p className="text-[10px] opacity-75 truncate">{acc.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="email"
                    required
                    placeholder="e.g. patient@careplus-hms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password *</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your registered email."); }} className="text-xs text-blue-600 hover:underline font-semibold">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Role Privilege</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="patient">🩺 Patient (View EHR & Book Appointments)</option>
                  <option value="doctor">👨‍⚕️ Doctor (Queue & E-Prescriptions)</option>
                  <option value="receptionist">📋 Receptionist (OPD Tokens & Beds)</option>
                  <option value="admin">👑 Admin (Full System Control)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Authenticating User...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Footer Link */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create a New Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
