// Legacy Auth API proxy - re-exports from centralized apiService.js
import apiService, {
  getAuthToken,
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile
} from './apiService';

export { getAuthToken };
export const registerPatientApi = registerUser;
export const loginPatientApi = loginUser;
export const logoutPatientApi = logoutUser;
export const fetchPatientProfileApi = getUserProfile;

export default apiService;
