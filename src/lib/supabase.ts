import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  user_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
  profile?: Profile;
};

export type BlockedSlot = {
  id: string;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  is_full_day: boolean;
  reason: string | null;
  created_at: string;
};

export type AppRole = 'admin' | 'client';

export type UserRole = {
  id: string;
  user_id: string;
  role: AppRole;
};
