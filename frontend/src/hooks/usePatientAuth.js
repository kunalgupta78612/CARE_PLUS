import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  loginPatientApi, 
  registerPatientApi, 
  logoutPatientApi, 
  fetchPatientProfileApi,
  getAuthToken
} from '../api/authApi';

// Query Key Constants
export const PATIENT_QUERY_KEYS = {
  profile: ['patient', 'profile'],
};

// 1. TanStack Query Hook: Fetch Protected Patient Profile
export const usePatientProfileQuery = () => {
  const token = getAuthToken();
  return useQuery({
    queryKey: PATIENT_QUERY_KEYS.profile,
    queryFn: fetchPatientProfileApi,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
};

// 2. TanStack Query Mutation: Login Patient
export const usePatientLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginPatientApi,
    onSuccess: (data) => {
      queryClient.setQueryData(PATIENT_QUERY_KEYS.profile, data.patient);
      queryClient.invalidateQueries({ queryKey: PATIENT_QUERY_KEYS.profile });
    },
  });
};

// 3. TanStack Query Mutation: Register Patient
export const usePatientRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerPatientApi,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('careplus_patient_token', data.token);
        localStorage.setItem('careplus_patient_user', JSON.stringify(data.patient));
        queryClient.setQueryData(PATIENT_QUERY_KEYS.profile, data.patient);
        queryClient.invalidateQueries({ queryKey: PATIENT_QUERY_KEYS.profile });
      }
    },
  });
};

// 4. TanStack Query Mutation: Logout Patient
export const usePatientLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutPatientApi,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: PATIENT_QUERY_KEYS.profile });
    },
  });
};
