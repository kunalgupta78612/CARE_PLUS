import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  CreditCard, 
  User, 
  Bell, 
  LogOut, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  Printer, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Menu,
  FileCheck,
  DollarSign
} from 'lucide-react';

import apiService from '../api/apiService';
import {
  usePatientProfileQuery,
  usePatientAppointmentsQuery,
  useCreateAppointmentMutation
} from '../hooks/useApiQueries';

const mockPatientProfile = {
  id: 'PT-9801',
  name: 'Alexander Wright',
  email: 'patient@careplus-hms.com',
  phone: '+1 (555) 234-5678',
  age: 34,
  gender: 'Male',
  bloodType: 'O+',
  address: '742 Evergreen Terrace, Springfield',
  allergies: ['Penicillin', 'Peanuts'],
  emergencyContact: 'Eleanor Wright (+1 555 987-6543)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
};



const mockPrescriptions = [
  {
    id: 'RX-7701',
    doctor: 'Dr. Sarah Jenkins, MD',
    date: '2026-08-28',
    medications: [
      { name: 'Atorvastatin', dosage: '20mg', frequency: '1 Tablet daily at bedtime', duration: '30 Days' },
      { name: 'Aspirin (Low Dose)', dosage: '81mg', frequency: '1 Tablet after breakfast', duration: '30 Days' }
    ],
    notes: 'Maintain low-sodium diet and daily 30-min cardio walking.'
  },
  {
    id: 'RX-7650',
    doctor: 'Dr. Michael Chen, MD',
    date: '2026-07-14',
    medications: [
      { name: 'Neuro B-Complex', dosage: '500mg', frequency: '1 Tablet twice daily', duration: '15 Days' }
    ],
    notes: 'Take with full glass of water after meal.'
  }
];

const mockMedicalReports = [
  {
    id: 'REP-4401',
    title: 'Complete Blood Count (CBC) & Lipid Panel',
    department: 'Pathology & Hematology',
    date: '2026-08-28',
    status: 'Ready',
    doctor: 'Dr. Sarah Jenkins',
    fileSize: '1.4 MB'
  },
  {
    id: 'REP-4389',
    title: '3T MRI Brain & Cranial Scan',
    department: 'Radiology & Imaging',
    date: '2026-08-15',
    status: 'Ready',
    doctor: 'Dr. Michael Chen',
    fileSize: '4.8 MB'
  },
  {
    id: 'REP-4210',
    title: 'Chest X-Ray (PA View)',
    department: 'Radiology & Imaging',
    date: '2026-06-10',
    status: 'Ready',
    doctor: 'Dr. Marcus Vance',
    fileSize: '2.1 MB'
  }
];

const mockInvoices = [
  {
    id: 'INV-9021',
    date: '2026-08-28',
    description: 'Cardiology Consultation & Lipid Panel',
    amount: '$185.00',
    status: 'Paid',
    method: 'Insurance & Credit Card'
  },
  {
    id: 'INV-8840',
    date: '2026-08-15',
    description: '3T MRI Brain Diagnostic Imaging',
    amount: '$450.00',
    status: 'Insurance Claimed',
    method: 'Aetna Health Plan'
  }
];

const mockNotifications = [
  { id: '1', title: 'Upcoming Appointment', message: 'Cardiology appointment with Dr. Sarah Jenkins on Sept 6 at 10:30 AM.', time: '2 hours ago', read: false },
  { id: '2', title: 'Lab Report Ready', message: 'Your Complete Blood Count & Lipid Panel report is ready to download.', time: '1 day ago', read: false },
  { id: '3', title: 'New E-Prescription Issued', message: 'Dr. Sarah Jenkins issued RX-7701 for Atorvastatin 20mg.', time: '3 days ago', read: true }
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { data: profileData } = usePatientProfileQuery();

  // REAL BACKEND DATA FETCHING VIA TANSTACK QUERY
  const { data: aptData } = usePatientAppointmentsQuery();
  const createAptMutation = useCreateAppointmentMutation();

  const statistics = aptData?.statistics || {
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  };

  const appointmentsList = aptData?.appointments || [];

  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

  const currentPatient = {
    id: profileData?.patientId || profileData?._id || storedUser?.patientId || storedUser?.id || 'PT-9801',
    name: profileData?.name || storedUser?.name || 'Alexander Wright',
    email: profileData?.email || storedUser?.email || 'patient@careplus-hms.com',
    phone: profileData?.phone || storedUser?.phone || '+1 (555) 234-5678',
    age: profileData?.age || storedUser?.age || 34,
    gender: profileData?.gender || storedUser?.gender || 'Male',
    bloodType: profileData?.bloodType || storedUser?.bloodType || 'O+',
    address: '742 Evergreen Terrace, Springfield',
    allergies: ['Penicillin', 'Peanuts'],
    emergencyContact: 'Eleanor Wright (+1 555 987-6543)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  };

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'appointments', 'prescriptions', 'reports', 'billing', 'profile'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [viewReportModal, setViewReportModal] = useState(null);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(null);

  const [notifications, setNotifications] = useState(mockNotifications);

  // New Booking Form State
  const [newDept, setNewDept] = useState('Cardiology & Heart Care');
  const [newDoc, setNewDoc] = useState('Dr. Sarah Jenkins, MD');
  const [newDate, setNewDate] = useState('2026-09-15');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await createAptMutation.mutateAsync({
        patientName: currentPatient.name,
        patientEmail: currentPatient.email,
        doctor: newDoc,
        department: newDept,
        date: newDate,
        timeSlot: newTime,
        type: 'OPD Consultation'
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await apiService.logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Mobile Menu & Logo */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">CarePlus <span className="text-blue-600">Patient Portal</span></span>
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Quick Book CTA */}
            <button
              onClick={() => setBookingModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900">Notifications ({notifications.length})</h4>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto my-2">
                    {notifications.map((n) => (
                      <div key={n.id} className={`py-3 px-2 rounded-xl text-xs space-y-1 ${!n.read ? 'bg-blue-50/50 font-medium' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-600">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Summary */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-blue-100">
                {currentPatient.name ? currentPatient.name[0].toUpperCase() : 'P'}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-slate-900 leading-tight">{currentPatient.name}</p>
                <p className="text-[11px] text-slate-500 font-semibold">{currentPatient.id}</p>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className={`lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 ${
          sidebarOpen ? 'block' : 'hidden lg:block'
        }`}>
          <div className="space-y-6">
            
            {/* Patient Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {currentPatient.name ? currentPatient.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'PT'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">{currentPatient.name}</h4>
                <p className="text-xs font-semibold text-blue-600">Blood Type: {currentPatient.bloodType}</p>
                <span className="inline-block text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded mt-1">
                  Active Patient
                </span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1 text-sm font-semibold text-slate-600">
              <button
                onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'appointments' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>My Appointments</span>
              </button>

              <button
                onClick={() => { setActiveTab('prescriptions'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'prescriptions' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Pill className="w-5 h-5" />
                <span>My Prescriptions</span>
              </button>

              <button
                onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'reports' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Medical Reports</span>
              </button>

              <button
                onClick={() => { setActiveTab('billing'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'billing' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Billing & Invoices</span>
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'profile' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Patient Profile</span>
              </button>
            </nav>

          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out / Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Quick Stats Cards using REAL BACKEND STATISTICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Appointments</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{statistics.total}</h3>
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">Real-time DB Sync</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-all">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Appointments</p>
                    <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{statistics.upcoming}</h3>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active Consultations</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-purple-300 transition-all">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Appointments</p>
                    <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{statistics.completed}</h3>
                    <p className="text-[11px] text-purple-600 font-semibold mt-1">Attended Care</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-rose-300 transition-all">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled Appointments</p>
                    <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{statistics.cancelled}</h3>
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">Cancelled Status</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Next Upcoming Appointment Highlight Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">
                    Next Consultation
                  </span>
                  <h3 className="text-2xl font-extrabold">Dr. Sarah Jenkins, MD</h3>
                  <p className="text-xs text-blue-100">
                    Cardiology & Heart Care • Room 304, Block B
                  </p>
                  <div className="flex items-center justify-center md:justify-start space-x-4 pt-2 text-xs font-bold">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Sept 6, 2026</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>10:30 AM</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('appointments')}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-blue-900 bg-white hover:bg-blue-50 shadow-lg transition-all"
                >
                  Manage Appointments
                </button>
              </div>

              {/* Recent Reports & Active Prescriptions Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Prescriptions Box */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">Active Prescriptions</h4>
                    <button 
                      onClick={() => setActiveTab('prescriptions')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {mockPrescriptions[0].medications.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{m.name} ({m.dosage})</p>
                          <p className="text-xs text-slate-500">{m.frequency}</p>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          {m.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Reports Box */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-base">Latest Diagnostic Reports</h4>
                    <button 
                      onClick={() => setActiveTab('reports')}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {mockMedicalReports.slice(0, 2).map((rep) => (
                      <div key={rep.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{rep.title}</p>
                          <p className="text-xs text-slate-500">{rep.date} • {rep.department}</p>
                        </div>
                        <button 
                          onClick={() => setViewReportModal(rep)}
                          className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">My Appointments</h3>
                  <p className="text-xs text-slate-500 mt-1">Book, view, or manage your hospital consultations</p>
                </div>
                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book New Appointment</span>
                </button>
              </div>

              {/* Appointments List using REAL BACKEND DATA */}
              <div className="space-y-4">
                {appointmentsList.length > 0 ? (
                  appointmentsList.map((apt) => (
                    <div key={apt._id || apt.id || apt.tokenNumber} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-300 transition-all">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1 font-extrabold text-sm">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-900 text-base">{apt.doctor}</h4>
                            <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                              apt.status === 'Completed' 
                                ? 'bg-purple-100 text-purple-800' 
                                : apt.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : apt.status === 'In Consultation'
                                ? 'bg-blue-100 text-blue-800 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">{apt.department}</p>
                          <p className="text-xs text-slate-500 mt-1">{apt.type || 'OPD Consultation'} • Token #{apt.tokenNumber || apt.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-left md:text-right text-xs">
                          <p className="font-bold text-slate-900">{apt.date}</p>
                          <p className="text-amber-600 font-bold">{apt.timeSlot || apt.time}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400">Token #{apt.tokenNumber || apt.id}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
                    No appointments booked yet. Click "Book New Appointment" to schedule your consultation.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">My E-Prescriptions</h3>
                <p className="text-xs text-slate-500 mt-1">Digital medication charts issued by your attending physicians</p>
              </div>

              <div className="space-y-6">
                {mockPrescriptions.map((rx) => (
                  <div key={rx.id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{rx.id}</span>
                        <h4 className="font-bold text-slate-900 text-base mt-1">{rx.doctor}</h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">Issued: {rx.date}</span>
                    </div>

                    <div className="space-y-3">
                      {rx.medications.map((m, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                            <p className="text-slate-500">Dosage: {m.dosage}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Frequency</p>
                            <p className="text-slate-500">{m.frequency}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Duration</p>
                            <p className="text-slate-500">{m.duration}</p>
                          </div>
                          <div className="flex items-center justify-end">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                              Active Rx
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-xs text-slate-500 italic">
                      Doctor Notes: "{rx.notes}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEDICAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Medical & Diagnostic Reports</h3>
                <p className="text-xs text-slate-500 mt-1">Download or view pathology, radiology, and lab test results</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Report Title</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Physician</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {mockMedicalReports.map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{rep.title}</td>
                          <td className="p-4 text-slate-600">{rep.department}</td>
                          <td className="p-4 text-slate-600">{rep.date}</td>
                          <td className="p-4 text-slate-600">{rep.doctor}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                              {rep.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setViewReportModal(rep)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BILLING & INVOICES */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Billing & Payment History</h3>
                <p className="text-xs text-slate-500 mt-1">Itemized receipts for clinical consultations, lab tests, and hospital care</p>
              </div>

              <div className="space-y-4">
                {mockInvoices.map((inv) => (
                  <div key={inv.id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-base">{inv.id}</span>
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1">{inv.description}</p>
                      <p className="text-xs text-slate-500">Billed Date: {inv.date} • Paid via {inv.method}</p>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-lg font-extrabold text-slate-900">{inv.amount}</span>
                      <button
                        onClick={() => setViewInvoiceModal(inv)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors"
                      >
                        Print Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PATIENT PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Patient Demographic Profile</h3>
                <p className="text-xs text-slate-500 mt-1">Personal health information, emergency contacts, and blood metrics</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
                
                <div className="flex items-center space-x-6 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                    {currentPatient.name ? currentPatient.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'PT'}
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900">{currentPatient.name}</h4>
                    <p className="text-xs font-bold text-blue-600">Patient ID: {currentPatient.id}</p>
                    <p className="text-xs text-slate-500 mt-1">{currentPatient.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Age & Gender</label>
                    <p className="font-bold text-slate-900 text-sm">{currentPatient.age} Years • {currentPatient.gender}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Blood Type</label>
                    <p className="font-bold text-rose-600 text-sm">{currentPatient.bloodType}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                    <p className="font-bold text-slate-900 text-sm">{currentPatient.phone}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Emergency Contact</label>
                    <p className="font-bold text-slate-900 text-sm">{currentPatient.emergencyContact}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Residential Address</label>
                    <p className="font-bold text-slate-900 text-sm">{currentPatient.address}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Known Allergies</label>
                    <div className="flex space-x-2 mt-1">
                      {currentPatient.allergies.map((a, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* BOOKING MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">Book OPD Appointment</h3>
              <button onClick={() => setBookingModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              {bookingSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl text-center">
                  Appointment Booked Successfully! Token Generated.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Cardiology & Heart Care">Cardiology & Heart Care</option>
                  <option value="Neurology & Brain Sciences">Neurology & Brain Sciences</option>
                  <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                  <option value="Orthopedics & Joint Care">Orthopedics & Joint Care</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor</label>
                <select
                  value={newDoc}
                  onChange={(e) => setNewDoc(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Dr. Sarah Jenkins, MD">Dr. Sarah Jenkins, MD</option>
                  <option value="Dr. Michael Chen, MD">Dr. Michael Chen, MD</option>
                  <option value="Dr. Emily Rodriguez, MD">Dr. Emily Rodriguez, MD</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
              >
                Confirm Appointment Token
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REPORT MODAL */}
      {viewReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">{viewReportModal.title}</h3>
              <button onClick={() => setViewReportModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p><strong>Department:</strong> {viewReportModal.department}</p>
              <p><strong>Issued Date:</strong> {viewReportModal.date}</p>
              <p><strong>Attending Physician:</strong> {viewReportModal.doctor}</p>
              <p><strong>File Size:</strong> {viewReportModal.fileSize}</p>
              <p><strong>Result Summary:</strong> All parameters within normal reference ranges. No acute abnormalities observed.</p>
            </div>

            <button
              onClick={() => { alert(`Downloading ${viewReportModal.title}...`); setViewReportModal(null); }}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Report PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW INVOICE RECEIPT MODAL */}
      {viewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Billing Receipt #{viewInvoiceModal.id}</h3>
              <button onClick={() => setViewInvoiceModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p><strong>Patient Name:</strong> Alexander Wright (PT-9801)</p>
              <p><strong>Description:</strong> {viewInvoiceModal.description}</p>
              <p><strong>Date Billed:</strong> {viewInvoiceModal.date}</p>
              <p><strong>Payment Status:</strong> {viewInvoiceModal.status}</p>
              <p className="text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">Total Billed: {viewInvoiceModal.amount}</p>
            </div>

            <button
              onClick={() => { alert(`Printing receipt #${viewInvoiceModal.id}...`); setViewInvoiceModal(null); }}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Billing Receipt</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
