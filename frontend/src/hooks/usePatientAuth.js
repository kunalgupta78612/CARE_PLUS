// Re-exports from centralized query hooks
export {
  API_QUERY_KEYS as PATIENT_QUERY_KEYS,
  useUserProfileQuery as usePatientProfileQuery,
  useLoginMutation as usePatientLoginMutation,
  useRegisterMutation as usePatientRegisterMutation,
  useLogoutMutation as usePatientLogoutMutation
} from './useApiQueries';
