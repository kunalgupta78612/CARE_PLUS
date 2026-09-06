// Re-exports from centralized query hooks
export {
  API_QUERY_KEYS as APPOINTMENT_QUERY_KEYS,
  usePatientAppointmentsQuery,
  useAllAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentStatusMutation
} from './useApiQueries';
