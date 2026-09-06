import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../api/apiService';

// Centralized Query Key Registry
export const API_QUERY_KEYS = {
  profile: ['user', 'profile'],
  myAppointments: ['appointments', 'my'],
  allAppointments: ['appointments', 'all'],
  invoices: ['billing', 'invoices'],
  patientDashboard: ['dashboard', 'patient'],
  receptionistDashboard: ['dashboard', 'receptionist']
};

// ==========================================
// 1. AUTHENTICATION & PROFILE HOOKS
// ==========================================

export const useUserProfileQuery = () => {
  const token = apiService.getAuthToken();
  return useQuery({
    queryKey: API_QUERY_KEYS.profile,
    queryFn: apiService.getUserProfile,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePatientProfileQuery = useUserProfileQuery;

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.loginUser,
    onSuccess: (data) => {
      queryClient.setQueryData(API_QUERY_KEYS.profile, data.patient);
      queryClient.invalidateQueries();
    },
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.registerUser,
    onSuccess: (data) => {
      if (data.patient) {
        queryClient.setQueryData(API_QUERY_KEYS.profile, data.patient);
        queryClient.invalidateQueries();
      }
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.logoutUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// ==========================================
// 2. APPOINTMENT & PATIENT DASHBOARD HOOKS
// ==========================================

export const usePatientAppointmentsQuery = () => {
  const token = apiService.getAuthToken();
  return useQuery({
    queryKey: API_QUERY_KEYS.myAppointments,
    queryFn: apiService.getMyAppointments,
    enabled: !!token,
    refetchInterval: 2000, // 2-second real-time auto polling
    staleTime: 1000,
  });
};

export const useAllAppointmentsQuery = () => {
  const token = apiService.getAuthToken();
  return useQuery({
    queryKey: API_QUERY_KEYS.allAppointments,
    queryFn: apiService.getAllAppointments,
    enabled: !!token,
    refetchInterval: 2000, // Real-time queue sync for receptionist
    staleTime: 1000,
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.myAppointments });
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.allAppointments });
    },
  });
};

export const useUpdateAppointmentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.myAppointments });
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.allAppointments });
    },
  });
};

// ==========================================
// 3. BILLING HOOKS
// ==========================================

export const useInvoicesQuery = () => {
  const token = apiService.getAuthToken();
  return useQuery({
    queryKey: API_QUERY_KEYS.invoices,
    queryFn: apiService.getInvoices,
    enabled: !!token,
    refetchInterval: 3000,
  });
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.invoices });
    },
  });
};

export const useUpdateInvoiceStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiService.updateInvoiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_QUERY_KEYS.invoices });
    },
  });
};
