export type UserType =
  | "CUSTOMER"
  | "BUSINESS_OWNER"
  | "BUSINESS_MANAGER"
  | "PLATFORM_MANAGER";

export interface UserProfile {
  id: number;
  tagline: string | null;
  suite_number: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  profile_photo: string | null;
  user_id: number;
  cover_photo: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserGroup {
  id: number;
  name: string;
  permissions: number[];
}

/** Shape returned by GET /users/get-current-user/ (UserSerializer). */
export interface CurrentUser {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string;
  phone_code: string | null;
  phone_number: string | null;
  groups: number[];
  groups_objects: UserGroup[];
  staff_number: string | null;
  is_admin: boolean;
  scopes: string | null;
  user_type: UserType;
  profile: UserProfile | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_code?: string;
  phone_number?: string;
}

export interface SendResetLinkPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  password_reset_code: string;
  password: string;
}
