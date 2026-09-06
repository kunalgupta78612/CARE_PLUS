// Legacy Appointment API proxy - re-exports from centralized apiService.js
import apiService, {
  getMyAppointments,
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus
} from './apiService';

export const fetchMyAppointmentsApi = getMyAppointments;
export const fetchAllAppointmentsApi = getAllAppointments;
export const createAppointmentApi = createAppointment;
export const updateAppointmentStatusApi = updateAppointmentStatus;

export default apiService;
