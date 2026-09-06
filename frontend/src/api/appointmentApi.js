import { getAuthToken } from './authApi';

const API_ENDPOINTS = [
  'http://localhost:5000/api/appointments',
  'http://127.0.0.1:5000/api/appointments',
  'http://localhost:5001/api/appointments',
  'http://127.0.0.1:5001/api/appointments'
];

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithFallback = async (path, options = {}) => {
  let lastError = null;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  for (const baseUrl of API_ENDPOINTS) {
    try {
      const url = `${baseUrl}${path}`;
      const res = await fetch(url, { ...options, headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Request failed with status ' + res.status);
      }
      return data;
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('ERR_CONNECTION_REFUSED')) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('Connection refused by backend server');
};

// 1. Fetch My Appointments & Statistics for Logged-In Patient
export const fetchMyAppointmentsApi = async () => {
  const token = getAuthToken();
  if (!token) {
    return {
      statistics: { total: 0, upcoming: 0, completed: 0, cancelled: 0 },
      appointments: []
    };
  }

  try {
    const data = await fetchWithFallback('/my-appointments', { method: 'GET' });
    return data;
  } catch (err) {
    // Local Session Fallback for Minor Project Offline Mode
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

// 2. Create Appointment API
export const createAppointmentApi = async (appointmentData) => {
  try {
    const data = await fetchWithFallback('/', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });

    // Sync to local storage
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

    return {
      success: true,
      message: 'Appointment booked successfully (Local Session)',
      appointment: mockApt
    };
  }
};

// 3. Update Appointment Status API
export const updateAppointmentStatusApi = async ({ id, status, date, timeSlot }) => {
  try {
    const data = await fetchWithFallback(`/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, date, timeSlot })
    });

    // Update local storage
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

    return { success: true, message: 'Status updated locally' };
  }
};
