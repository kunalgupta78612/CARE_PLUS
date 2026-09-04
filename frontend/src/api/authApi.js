const API_BASE_URL = 'http://localhost:5000/api/patient';

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

// 1. Patient Registration
export const registerPatientApi = async (patientData) => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

// 2. Patient Login
export const loginPatientApi = async (credentials) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  if (data.token) {
    localStorage.setItem('careplus_patient_token', data.token);
    localStorage.setItem('careplus_patient_user', JSON.stringify(data.patient));
  }
  return data;
};

// 3. Patient Logout
export const logoutPatientApi = async () => {
  try {
    await fetch(`${API_BASE_URL}/logout`, {
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

// 4. Fetch Protected Patient Profile (JWT Required)
export const fetchPatientProfileApi = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('No JWT token found');

  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch patient profile');
  return data.patient;
};
