import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BedDouble, UserCheck, Plus, Clock, LogOut, CheckCircle2 } from 'lucide-react';

const mockBeds = [
  { id: 'ICU-101', ward: 'ICU Unit', status: 'Occupied', patient: 'Eleanor Vance' },
  { id: 'ICU-102', ward: 'ICU Unit', status: 'Available', patient: '-' },
  { id: 'WRD-201', ward: 'General Ward', status: 'Occupied', patient: 'Alexander Wright' },
  { id: 'WRD-202', ward: 'General Ward', status: 'Cleaning', patient: '-' },
  { id: 'STE-301', ward: 'Private Suite', status: 'Available', patient: '-' },
  { id: 'STE-302', ward: 'Private Suite', status: 'Occupied', patient: 'David Thorne' }
];

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [beds, setBeds] = useState(mockBeds);
  const [walkinName, setWalkinName] = useState('');
  const [walkinDept, setWalkinDept] = useState('Cardiology & Heart Care');
  const [generatedToken, setGeneratedToken] = useState('');

  const handleGenerateToken = (e) => {
    e.preventDefault();
    const token = 'OPD-' + Math.floor(1000 + Math.random() * 9000);
    setGeneratedToken(token);
    setWalkinName('');
  };

  const toggleBedStatus = (bedId) => {
    setBeds(beds.map(b => {
      if (b.id === bedId) {
        const nextStatus = b.status === 'Available' ? 'Occupied' : 'Available';
        return { ...b, status: nextStatus, patient: nextStatus === 'Occupied' ? 'Walk-in Patient' : '-' };
      }
      return b;
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('careplus_patient_token');
    localStorage.removeItem('careplus_patient_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
              📋
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">CarePlus <span className="text-amber-400">Reception Desk</span></h2>
              <p className="text-[10px] text-slate-400">Patient Admissions, OPD Tokens & Ward Allocation</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              📋 Role: RECEPTIONIST
            </span>
            <button onClick={handleLogout} className="text-slate-300 hover:text-rose-400 text-xs font-bold flex items-center space-x-1">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Rapid Walk-in Check-in & OPD Token Generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <span>Rapid Walk-in Patient Check-in</span>
            </div>

            {generatedToken && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-1">
                <span className="text-xs font-bold uppercase">OPD Token Generated</span>
                <h3 className="text-2xl font-extrabold text-amber-600">{generatedToken}</h3>
                <p className="text-xs">Direct patient to OPD Clinic Room 102</p>
              </div>
            )}

            <form onSubmit={handleGenerateToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Department *</label>
                <select
                  value={walkinDept}
                  onChange={(e) => setWalkinDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Cardiology & Heart Care">Cardiology & Heart Care</option>
                  <option value="Neurology & Brain Sciences">Neurology & Brain Sciences</option>
                  <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                  <option value="Orthopedics & Joint Care">Orthopedics & Joint Care</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Live OPD Token</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Bed & Ward Allocation Visual Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg">
                <BedDouble className="w-5 h-5 text-amber-600" />
                <span>Live Ward & Bed Occupancy Map</span>
              </div>
              <span className="text-xs font-bold text-slate-500">Click bed card to toggle status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {beds.map((b) => (
                <div
                  key={b.id}
                  onClick={() => toggleBedStatus(b.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-105 ${
                    b.status === 'Occupied' 
                      ? 'bg-rose-50 border-rose-200 text-rose-900' 
                      : b.status === 'Available'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-sm">{b.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      b.status === 'Occupied' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs opacity-75">{b.ward}</p>
                  <p className="text-xs font-bold mt-2">Patient: {b.patient}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReceptionistDashboard;
