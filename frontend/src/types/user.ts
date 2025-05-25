export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  bio?: string;
  preferences?: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPreferences {
  notifications?: boolean;
  tourPreferences?: string[];
  language?: string;
  currency?: string;
}

export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  bio?: string;
  preferences?: UserPreferences;
} 