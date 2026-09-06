import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Clock, 
  UserCheck, 
  CreditCard, 
  LogOut, 
  Plus, 
  Search, 
  CheckCircle2, 
  Edit3, 
  FileText, 
  DollarSign, 
  Filter, 
  User, 
  ShieldCheck, 
  Stethoscope, 
  X, 
  ChevronRight,
  AlertCircle,
  Printer
} from 'lucide-react';
import { logoutPatientApi } from '../api/authApi';

const DEFAULT_APPOINTMENTS = [
  {
    id: 'OPD-1082',
    tokenNumber: 'OPD-1082',
    patientName: 'Alexander Wright',
    patientId: 'PT-9801',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    date: '2026-09-06',
    timeSlot: '10:30 AM',
    status: 'Confirmed',
    consultationType: 'Cardiology OPD'
  },
  {
    id: 'OPD-1090',
    tokenNumber: 'OPD-1090',
    patientName: 'Maria Garcia',
    patientId: 'PT-9822',
    doctor: 'Dr. Michael Chen, MD',
    department: 'Neurology & Brain Sciences',
    date: '2026-09-06',
    timeSlot: '11:15 AM',
    status: 'Confirmed',
    consultationType: 'Neurology Review'
  },
  {
    id: 'OPD-1104',
    tokenNumber: 'OPD-1104',
    patientName: 'David Thorne',
    patientId: 'PT-9840',
    doctor: 'Dr. Emily Rodriguez, MD',
    department: 'Pediatrics & Child Health',
    date: '2026-09-07',
    timeSlot: '02:00 PM',
    status: 'Confirmed',
    consultationType: 'Pediatric Checkup'
  },
  {
    id: 'OPD-1070',
    tokenNumber: 'OPD-1070',
    patientName: 'Eleanor Vance',
    patientId: 'PT-9788',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    date: '2026-09-06',
    timeSlot: '09:30 AM',
    status: 'Completed',
    consultationType: 'ECG Follow-up'
  }
];

const DEFAULT_INVOICES = [
  {
    id: 'INV-9021',
    patientName: 'Alexander Wright',
    patientId: 'PT-9801',
    description: 'Cardiology Consultation & ECG Diagnostic',
    amount: 185.00,
    status: 'Paid',
    method: 'Credit Card',
    date: '2026-09-06'
  },
  {
    id: 'INV-9022',
    patientName: 'Maria Garcia',
    patientId: 'PT-9822',
    description: '3T MRI Brain Diagnostic Scan',
    amount: 450.00,
    status: 'Pending',
    method: 'Insurance Claim Pending',
    date: '2026-09-06'
  },
  {
    id: 'INV-9023',
    patientName: 'David Thorne',
    patientId: 'PT-9840',
    description: 'Pediatric OPD Consultation & Prescription',
    amount: 120.00,
    status: 'Paid',
    method: 'Cash / Reception',
    date: '2026-09-05'
  }
];

const DOCTOR_LIST = [
  'All Doctors',
  'Dr. Sarah Jenkins, MD',
  'Dr. Michael Chen, MD',
  'Dr. Emily Rodriguez, MD',
  'Dr. Marcus Vance, MD'
];

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  // Load authenticated Receptionist session
  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const user = storedUserJson ? JSON.parse(storedUserJson) : null;
  const receptionistName = user?.name || 'Sarah Davis';
  const receptionistEmail = user?.email || 'receptionist@careplus-hms.com';

  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'doctorQueue', 'billing', 'walkin', 'profile'
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('All Doctors');
  const [statusFilter, setStatusFilter] = useState('All');

  // Reschedule / Edit Modal state
  const [editingApt, setEditingApt] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Create Bill Modal state
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [newBillPatient, setNewBillPatient] = useState('');
  const [newBillDesc, setNewBillDesc] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillStatus, setNewBillStatus] = useState('Pending');
  const [newBillMethod, setNewBillMethod] = useState('Cash');

  // Walk-in Token state
  const [walkinName, setWalkinName] = useState('');
  const [walkinDept, setWalkinDept] = useState('Cardiology & Heart Care');
  const [walkinDoc, setWalkinDoc] = useState('Dr. Sarah Jenkins, MD');
  const [generatedToken, setGeneratedToken] = useState(null);

  // Initialize and Sync Appointments and Invoices with LocalStorage
  useEffect(() => {
    try {
      const storedApts = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
      if (storedApts.length > 0) {
        // Merge stored appointments with default mock appointments (avoiding duplicates)
        const combined = [...storedApts];
        DEFAULT_APPOINTMENTS.forEach((def) => {
          if (!combined.some((a) => a.id === def.id || a.tokenNumber === def.tokenNumber)) {
            combined.push(def);
          }
        });
        setAppointments(combined);
      } else {
        setAppointments(DEFAULT_APPOINTMENTS);
        localStorage.setItem('careplus_appointments', JSON.stringify(DEFAULT_APPOINTMENTS));
      }

      const storedInvoices = JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
      if (storedInvoices.length > 0) {
        setInvoices(storedInvoices);
      } else {
        setInvoices(DEFAULT_INVOICES);
        localStorage.setItem('careplus_invoices', JSON.stringify(DEFAULT_INVOICES));
      }
    } catch (err) {
      setAppointments(DEFAULT_APPOINTMENTS);
      setInvoices(DEFAULT_INVOICES);
    }
  }, []);

  // Save changes to localStorage when appointments state mutates
  const saveAppointments = (updatedApts) => {
    setAppointments(updatedApts);
    try {
      localStorage.setItem('careplus_appointments', JSON.stringify(updatedApts));
    } catch (err) {
      console.error(err);
    }
  };

  // Save changes to localStorage when invoices state mutates
  const saveInvoices = (updatedInvoices) => {
    setInvoices(updatedInvoices);
    try {
      localStorage.setItem('careplus_invoices', JSON.stringify(updatedInvoices));
    } catch (err) {
      console.error(err);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await logoutPatientApi();
    navigate('/login');
  };

  // Handle Edit/Reschedule Submission
  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!editingApt) return;

    const updated = appointments.map((a) => {
      if (a.id === editingApt.id || a.tokenNumber === editingApt.tokenNumber) {
        return {
          ...a,
          date: editDate,
          timeSlot: editTime,
          status: editStatus
        };
      }
      return a;
    });

    saveAppointments(updated);
    setEditingApt(null);
  };

  // Handle Create New Bill Submission
  const handleCreateBill = (e) => {
    e.preventDefault();
    const newInv = {
      id: 'INV-' + Math.floor(9000 + Math.random() * 1000),
      patientName: newBillPatient,
      patientId: 'PT-' + Math.floor(1000 + Math.random() * 9000),
      description: newBillDesc,
      amount: parseFloat(newBillAmount) || 100.00,
      status: newBillStatus,
      method: newBillMethod,
      date: new Date().toISOString().split('T')[0]
    };

    saveInvoices([newInv, ...invoices]);
    setBillModalOpen(false);
    setNewBillPatient('');
    setNewBillDesc('');
    setNewBillAmount('');
  };

  // Handle Mark Invoice Paid
  const handleMarkPaid = (invId) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invId) {
        return { ...inv, status: 'Paid', method: 'Cash / Card' };
      }
      return inv;
    });
    saveInvoices(updated);
  };

  // Handle Walk-in Token Generation
  const handleGenerateWalkinToken = (e) => {
    e.preventDefault();
    const newToken = 'OPD-' + Math.floor(1000 + Math.random() * 9000);
    const newApt = {
      id: newToken,
      tokenNumber: newToken,
      patientName: walkinName || 'Walk-in Patient',
      patientId: 'PT-' + Math.floor(1000 + Math.random() * 9000),
      doctor: walkinDoc,
      department: walkinDept,
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Live Queue (Immediate)',
      status: 'Confirmed',
      consultationType: 'Walk-in OPD Triage'
    };

    saveAppointments([newApt, ...appointments]);
    setGeneratedToken(newApt);
    setWalkinName('');
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.tokenNumber && apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDoctor = 
      selectedDoctorFilter === 'All Doctors' || apt.doctor === selectedDoctorFilter;

    const matchesStatus = 
      statusFilter === 'All' || apt.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDoctor && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md">
              📋
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
                <span>CarePlus</span>
                <span className="text-amber-400">Reception Desk</span>
              </h1>
              <p className="text-[10px] text-slate-400">Real-time Appointments, Patient Triage & Billing Console</p>
            </div>
          </div>

          {/* User Session Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                {receptionistName[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-100 leading-tight">👋 {receptionistName}</p>
                <span className="text-[9px] font-extrabold uppercase text-amber-400">RECEPTIONIST</span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
              title="Logout / Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Navigation Tabs Header */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'appointments' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Real-time Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doctorQueue')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'doctorQueue' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor-wise Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'billing' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('walkin')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'walkin' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Rapid Walk-in Check-in</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'profile' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Receptionist Profile</span>
          </button>
        </div>

        {/* TAB 1: ALL APPOINTMENTS (Real-Time) */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by Patient, Doctor, or Token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Doctor:</span>
                  <select
                    value={selectedDoctorFilter}
                    onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    {DOCTOR_LIST.map((doc, idx) => (
                      <option key={idx} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Real-Time Patient Appointments Queue</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Showing {filteredAppointments.length} matching appointments</p>
                </div>
                <button
                  onClick={() => setActiveTab('walkin')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-md"
                >
                  + Add Walk-in Patient
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Token / ID</th>
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Assigned Doctor</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id || apt.tokenNumber} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-amber-600">
                            {apt.tokenNumber || apt.id}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{apt.patientName}</p>
                            <p className="text-[10px] text-slate-400">{apt.patientId || 'PT-9801'}</p>
                          </td>
                          <td className="p-4 font-bold text-slate-800">{apt.doctor}</td>
                          <td className="p-4 text-slate-600">{apt.department}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{apt.date}</p>
                            <p className="text-slate-500">{apt.timeSlot}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              apt.status === 'Confirmed' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : apt.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : apt.status === 'Rescheduled'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setEditingApt(apt);
                                setEditDate(apt.date);
                                setEditTime(apt.timeSlot);
                                setEditStatus(apt.status);
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 font-bold transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Reschedule / Update</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400">
                          No patient appointments found matching the selected filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DOCTOR-WISE APPOINTMENTS QUEUE */}
        {activeTab === 'doctorQueue' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Doctor-Wise Appointment Schedules</h2>
                <p className="text-xs text-slate-500 mt-1">Select a doctor to view their assigned OPD consultations for today</p>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <Stethoscope className="w-5 h-5 text-amber-500" />
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-amber-500"
                >
                  {DOCTOR_LIST.map((doc, idx) => (
                    <option key={idx} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor Queue Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((apt) => (
                <div key={apt.id || apt.tokenNumber} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-amber-400 transition-all">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md">
                        {apt.tokenNumber || apt.id}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base mt-2">{apt.patientName}</h3>
                      <p className="text-xs text-slate-500">{apt.consultationType || 'OPD Checkup'}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${
                      apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Assigned Doctor:</span>
                      <strong className="text-slate-800">{apt.doctor}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span>{apt.department}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Scheduled Date:</span>
                      <strong>{apt.date}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Time Slot:</span>
                      <strong className="text-amber-600">{apt.timeSlot}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingApt(apt);
                      setEditDate(apt.date);
                      setEditTime(apt.timeSlot);
                      setEditStatus(apt.status);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-amber-700 bg-amber-50 hover:bg-amber-500 hover:text-white transition-colors"
                  >
                    Change Status / Reschedule
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: BILLING & INVOICES MANAGEMENT */}
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Patient Billing & Invoices</h2>
                <p className="text-xs text-slate-500 mt-1">Create patient billing receipts and manage payment collection statuses</p>
              </div>

              <button
                onClick={() => setBillModalOpen(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Patient Invoice</span>
              </button>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base">{inv.id}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{inv.patientName} ({inv.patientId})</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{inv.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Billed Date: {inv.date} • Method: {inv.method}</p>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="text-xl font-extrabold text-slate-900">${inv.amount.toFixed(2)}</span>
                    
                    {inv.status === 'Pending' ? (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        ✓ Payment Settled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: RAPID WALK-IN CHECK-IN */}
        {activeTab === 'walkin' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Rapid Walk-in Patient OPD Triage</h2>
                <p className="text-xs text-slate-500 mt-1">Generate immediate OPD consultation tokens for emergency or walk-in patients</p>
              </div>

              {generatedToken && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2 animate-in zoom-in-95">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200">
                    Live Token Issued
                  </span>
                  <h3 className="text-3xl font-extrabold text-emerald-700">Token #{generatedToken.tokenNumber}</h3>
                  <p className="text-xs font-bold text-slate-800">Patient: {generatedToken.patientName}</p>
                  <p className="text-xs text-slate-600">Assigned: {generatedToken.doctor} ({generatedToken.department})</p>
                </div>
              )}

              <form onSubmit={handleGenerateWalkinToken} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={walkinDept}
                    onChange={(e) => setWalkinDept(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Cardiology & Heart Care">Cardiology & Heart Care</option>
                    <option value="Neurology & Brain Sciences">Neurology & Brain Sciences</option>
                    <option value="Pediatrics & Child Health">Pediatrics & Child Health</option>
                    <option value="Orthopedics & Joint Care">Orthopedics & Joint Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Attending Doctor *</label>
                  <select
                    value={walkinDoc}
                    onChange={(e) => setWalkinDoc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Dr. Sarah Jenkins, MD">Dr. Sarah Jenkins, MD</option>
                    <option value="Dr. Michael Chen, MD">Dr. Michael Chen, MD</option>
                    <option value="Dr. Emily Rodriguez, MD">Dr. Emily Rodriguez, MD</option>
                    <option value="Dr. Marcus Vance, MD">Dr. Marcus Vance, MD</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Issue Live OPD Token Code</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: RECEPTIONIST PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg ring-4 ring-amber-100">
                  {receptionistName[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{receptionistName}</h2>
                  <p className="text-xs font-bold text-amber-600">Employee ID: REC-4091</p>
                  <p className="text-xs text-slate-500 mt-0.5">{receptionistEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Role / Designation</label>
                  <p className="font-bold text-slate-900 text-sm">Hospital Receptionist</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Desk Location</label>
                  <p className="font-bold text-slate-900 text-sm">Main OPD Entrance - Counter 2</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Current Shift</label>
                  <p className="font-bold text-emerald-600 text-sm">Morning Shift (08:00 AM - 04:00 PM)</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">System Authorization</label>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    JWT Session Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* RESCHEDULE / EDIT APPOINTMENT MODAL */}
      {editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Reschedule & Update Status</h3>
                <p className="text-xs text-slate-500">Patient: {editingApt.patientName}</p>
              </div>
              <button onClick={() => setEditingApt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reschedule Date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white font-bold"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md"
              >
                Save Updated Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW BILL MODAL */}
      {billModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">Create Patient Billing Invoice</h3>
              <button onClick={() => setBillModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newBillPatient}
                  onChange={(e) => setNewBillPatient(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Consultation & Blood Panel"
                  value={newBillDesc}
                  onChange={(e) => setNewBillDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={newBillAmount}
                    onChange={(e) => setNewBillAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={newBillStatus}
                    onChange={(e) => setNewBillStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={newBillMethod}
                  onChange={(e) => setNewBillMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Cash / Reception">Cash / Reception</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Insurance Claim">Insurance Claim</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md"
              >
                Generate Official Invoice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceptionistDashboard;
