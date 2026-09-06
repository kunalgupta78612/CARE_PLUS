const API_ENDPOINTS = [
  'http://localhost:5000/api/patient',
  'http://127.0.0.1:5000/api/patient',
  'http://localhost:5001/api/patient',
  'http://127.0.0.1:5001/api/patient'
];

// Helper to get stored JWT Token
export const getAuthToken = () => {
  return localStorage.getItem('careplus_patient_token');
};

// Helper for Authorization Headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Robust fetch wrapper with multi-port automatic fallback
const fetchWithFallback = async (path, options = {}) => {
  let lastError = null;

  for (const baseUrl of API_ENDPOINTS) {
    try {
      const url = `${baseUrl}${path}`;
      const res = await fetch(url, options);
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

// 1. Patient Registration API
export const registerPatientApi = async (patientData) => {
  try {
    const data = await fetchWithFallback('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });

    if (data.token) {
      localStorage.setItem('careplus_patient_token', data.token);
      localStorage.setItem('careplus_patient_user', JSON.stringify(data.patient));
    }
    return data;
  } catch (err) {
    // Offline / Connection Refused Graceful Local Session Fallback for minor project demo
    if (err.message.includes('Failed to fetch') || err.message.includes('Connection refused') || err.message.includes('NetworkError')) {
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
        bloodType: patientData.bloodType || 'O+',
        allergies: [],
        emergencyContact: ''
      };
      localStorage.setItem('careplus_patient_token', mockToken);
      localStorage.setItem('careplus_patient_user', JSON.stringify(mockPatient));

      return {
        success: true,
        message: 'Registered successfully (Local Session Mode)',
        token: mockToken,
        patient: mockPatient
      };
    }
    throw err;
  }
};

// 2. Patient Login API
export const loginPatientApi = async (credentials) => {
  try {
    const data = await fetchWithFallback('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      localStorage.setItem('careplus_patient_token', data.token);
      localStorage.setItem('careplus_patient_user', JSON.stringify(data.patient));
    }
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('Connection refused') || err.message.includes('NetworkError')) {
      const mockToken = 'mock_jwt_token_demo';
      const mockPatient = {
        id: 'mem-pat-9801',
        patientId: 'PT-9801',
        name: 'Alexander Wright',
        email: credentials.email,
        phone: '+1 (555) 234-5678',
        role: 'patient',
        age: 34,
        gender: 'Male',
        bloodType: 'O+'
      };
      localStorage.setItem('careplus_patient_token', mockToken);
      localStorage.setItem('careplus_patient_user', JSON.stringify(mockPatient));

      return {
        success: true,
        message: 'Logged in successfully (Local Demo Mode)',
        token: mockToken,
        patient: mockPatient
      };
    }
    throw err;
  }
};

// 3. Patient Logout API
export const logoutPatientApi = async () => {
  try {
    await fetchWithFallback('/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    // Ignore network error on logout
  } finally {
    localStorage.removeItem('careplus_patient_token');
    localStorage.removeItem('careplus_patient_user');
  }
  return { success: true };
};

// 4. Fetch Protected Patient Profile API
export const fetchPatientProfileApi = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('No JWT token found');

  try {
    const data = await fetchWithFallback('/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return data.patient;
  } catch (err) {
    const storedUserJson = localStorage.getItem('careplus_patient_user');
    if (storedUserJson) {
      return JSON.parse(storedUserJson);
    }
    throw err;
  }
};
