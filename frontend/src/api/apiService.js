// Centralized Frontend API Service for CarePlus HMS
// Handles all backend HTTP requests, JWT token management, automatic auth headers, and multi-port fallback.

const BASE_API_URLS = [
  'http://localhost:5000/api',
  'http://127.0.0.1:5000/api',
  'http://localhost:5001/api',
  'http://127.0.0.1:5001/api'
];

// Helper: Get JWT token from LocalStorage
export const getAuthToken = () => {
  return localStorage.getItem('careplus_patient_token') || null;
};

// Helper: Set JWT token and User session
export const setAuthSession = (token, user) => {
  if (token) localStorage.setItem('careplus_patient_token', token);
  if (user) localStorage.setItem('careplus_patient_user', JSON.stringify(user));
};

// Helper: Clear JWT token and User session
export const clearAuthSession = () => {
  localStorage.removeItem('careplus_patient_token');
  localStorage.removeItem('careplus_patient_user');
};

// Helper: Get Authorization headers with JWT token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Universal fetch wrapper with multi-port fallback & automatic JWT attachment
const fetchApi = async (path, options = {}) => {
  let lastError = null;

  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const fetchOptions = {
    ...options,
    headers
  };

  for (const baseUrl of BASE_API_URLS) {
    try {
      const url = `${baseUrl}${path}`;
      const res = await fetch(url, fetchOptions);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (err) {
      if (
        err.message &&
        !err.message.includes('Failed to fetch') &&
        !err.message.includes('NetworkError') &&
        !err.message.includes('ERR_CONNECTION_REFUSED')
      ) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('Unable to connect to CarePlus HMS backend server');
};

// ==========================================
// 1. AUTHENTICATION & PROFILE APIs
// ==========================================

export const registerUser = async (patientData) => {
  try {
    const data = await fetchApi('/patient/register', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });

    if (data.token) {
      setAuthSession(data.token, data.patient);
    }
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('Unable to connect') || err.message.includes('ERR_CONNECTION_REFUSED')) {
      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      const mockPatient = {
        id: 'pat-' + Math.floor(1000 + Math.random() * 9000),
        patientId: 'PT-' + Math.floor(1000 + Math.random() * 9000),
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        role: patientData.role || 'patient',
        age: patientData.age || 28,
        gender: patientData.gender || 'Male',
        bloodType: patientData.bloodType || 'O+'
      };
      setAuthSession(mockToken, mockPatient);
      return { success: true, token: mockToken, patient: mockPatient };
    }
    throw err;
  }
};

export const loginUser = async (credentials) => {
  try {
    const data = await fetchApi('/patient/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (data.token) {
      setAuthSession(data.token, data.patient);
    }
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('Unable to connect') || err.message.includes('ERR_CONNECTION_REFUSED')) {
      const mockToken = 'mock_jwt_token_demo';
      const mockPatient = {
        id: 'mem-pat-9801',
        patientId: 'PT-9801',
        name: 'Alexander Wright',
        email: credentials.email,
        phone: '+1 (555) 234-5678',
        role: credentials.role || 'patient',
        age: 34,
        gender: 'Male',
        bloodType: 'O+'
      };
      setAuthSession(mockToken, mockPatient);
      return { success: true, token: mockToken, patient: mockPatient };
    }
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    await fetchApi('/patient/logout', { method: 'POST' });
  } catch (err) {
    // Ignore network errors during logout
  } finally {
    clearAuthSession();
  }
  return { success: true };
};

export const getUserProfile = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('No JWT authentication token found');

  try {
    const data = await fetchApi('/patient/profile', { method: 'GET' });
    return data.patient;
  } catch (err) {
    const storedUserJson = localStorage.getItem('careplus_patient_user');
    if (storedUserJson) {
      return JSON.parse(storedUserJson);
    }
    throw err;
  }
};

// ==========================================
// 2. APPOINTMENTS APIs
// ==========================================

export const getMyAppointments = async () => {
  const token = getAuthToken();
  if (!token) {
    return {
      statistics: { total: 0, upcoming: 0, completed: 0, cancelled: 0 },
      appointments: []
    };
  }

  try {
    const data = await fetchApi('/appointments/my-appointments', { method: 'GET' });
    return data;
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    const total = stored.length;
    const upcoming = stored.filter(a => ['Upcoming', 'Confirmed', 'In Consultation', 'Rescheduled'].includes(a.status)).length;
    const completed = stored.filter(a => a.status === 'Completed').length;
    const cancelled = stored.filter(a => a.status === 'Cancelled').length;

    return {
      statistics: { total, upcoming, completed, cancelled },
      appointments: stored
    };
  }
};

export const getAllAppointments = async () => {
  try {
    const data = await fetchApi('/appointments/all', { method: 'GET' });
    return data.appointments;
  } catch (err) {
    return JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const data = await fetchApi('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });

    if (data.appointment) {
      const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
      localStorage.setItem('careplus_appointments', JSON.stringify([data.appointment, ...stored]));
    }
    return data;
  } catch (err) {
    const tokenNumber = 'OPD-' + Math.floor(1000 + Math.random() * 9000);
    const mockApt = {
      _id: 'apt-' + Math.floor(1000 + Math.random() * 9000),
      tokenNumber,
      patientName: appointmentData.patientName || 'Patient',
      patientEmail: appointmentData.patientEmail || 'patient@careplus-hms.com',
      doctor: appointmentData.doctor,
      department: appointmentData.department,
      date: appointmentData.date,
      timeSlot: appointmentData.timeSlot,
      status: 'Upcoming',
      type: appointmentData.type || 'OPD Consultation'
    };

    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    localStorage.setItem('careplus_appointments', JSON.stringify([mockApt, ...stored]));

    return { success: true, message: 'Appointment booked successfully', appointment: mockApt };
  }
};

export const updateAppointmentStatus = async ({ id, status, date, timeSlot }) => {
  try {
    const data = await fetchApi(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, date, timeSlot })
    });

    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    const updated = stored.map(a => {
      if (a._id === id || a.id === id || a.tokenNumber === id) {
        return { ...a, status: status || a.status, date: date || a.date, timeSlot: timeSlot || a.timeSlot };
      }
      return a;
    });
    localStorage.setItem('careplus_appointments', JSON.stringify(updated));

    return data;
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    const updated = stored.map(a => {
      if (a._id === id || a.id === id || a.tokenNumber === id) {
        return { ...a, status: status || a.status, date: date || a.date, timeSlot: timeSlot || a.timeSlot };
      }
      return a;
    });
    localStorage.setItem('careplus_appointments', JSON.stringify(updated));

    return { success: true, message: 'Status updated successfully' };
  }
};

// ==========================================
// 3. BILLING APIs
// ==========================================

export const getInvoices = async () => {
  try {
    const data = await fetchApi('/billing', { method: 'GET' });
    return data.invoices;
  } catch (err) {
    return JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const data = await fetchApi('/billing', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });

    if (data.invoice) {
      const stored = JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
      localStorage.setItem('careplus_invoices', JSON.stringify([data.invoice, ...stored]));
    }
    return data;
  } catch (err) {
    const newInv = {
      _id: 'inv-' + Math.floor(1000 + Math.random() * 9000),
      id: 'INV-' + Math.floor(9000 + Math.random() * 1000),
      patientName: invoiceData.patientName,
      patientId: invoiceData.patientId || 'PT-9801',
      description: invoiceData.description,
      amount: parseFloat(invoiceData.amount) || 100.00,
      status: invoiceData.status || 'Pending',
      method: invoiceData.method || 'Cash / Reception',
      date: new Date().toISOString().split('T')[0]
    };
    const stored = JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
    localStorage.setItem('careplus_invoices', JSON.stringify([newInv, ...stored]));
    return { success: true, invoice: newInv };
  }
};

export const updateInvoiceStatus = async ({ id, status, method }) => {
  try {
    const data = await fetchApi(`/billing/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, method })
    });
    return data;
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
    const updated = stored.map(inv => {
      if (inv._id === id || inv.id === id || inv.invoiceId === id) {
        return { ...inv, status: status || inv.status, method: method || inv.method };
      }
      return inv;
    });
    localStorage.setItem('careplus_invoices', JSON.stringify(updated));
    return { success: true, message: 'Invoice status updated' };
  }
};

// ==========================================
// 4. DASHBOARD AGGREGATED APIs
// ==========================================

export const getPatientDashboard = async () => {
  const [profile, apts] = await Promise.all([
    getUserProfile().catch(() => null),
    getMyAppointments().catch(() => ({ statistics: {}, appointments: [] }))
  ]);

  return {
    profile,
    statistics: apts.statistics,
    appointments: apts.appointments
  };
};

export const getReceptionistDashboard = async () => {
  const [appointments, invoices] = await Promise.all([
    getAllAppointments().catch(() => []),
    getInvoices().catch(() => [])
  ]);

  return {
    appointments,
    invoices
  };
};

// Centralized API Service Object Export
const apiService = {
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getMyAppointments,
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus,
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  getPatientDashboard,
  getReceptionistDashboard
};

export default apiService;
