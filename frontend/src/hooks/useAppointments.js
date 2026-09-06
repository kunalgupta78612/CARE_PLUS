import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchMyAppointmentsApi, 
  createAppointmentApi, 
  updateAppointmentStatusApi 
} from '../api/appointmentApi';
import { getAuthToken } from '../api/authApi';

export const APPOINTMENT_QUERY_KEYS = {
  myAppointments: ['appointments', 'my-appointments'],
};

// 1. TanStack Query Hook: Real-Time Patient Appointments & Statistics
export const usePatientAppointmentsQuery = () => {
  const token = getAuthToken();

  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.myAppointments,
    queryFn: fetchMyAppointmentsApi,
    enabled: !!token,
    refetchInterval: 2000, // 2-second real-time polling auto refetch
    staleTime: 1000,
  });
};

// 2. TanStack Query Mutation: Create Appointment
export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointmentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.myAppointments });
    },
  });
};

// 3. TanStack Query Mutation: Update Appointment Status
export const useUpdateAppointmentStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.myAppointments });
    },
  });
};
