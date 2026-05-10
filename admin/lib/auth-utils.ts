import { User } from "@supabase/supabase-js";
import { supabaseauth } from "./supabaseauth";


/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabaseauth.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get user's session
 */
export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabaseauth.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Optional: Add more validation rules
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format user metadata for display
 */
export function formatUserData(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || 'User',
    phone: user.user_metadata?.phone || '',
    provider: user.app_metadata?.provider || 'email',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
  };
}

/**
 * Get user's profile information from metadata
 */
export function getUserProfile(user: User) {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || '',
    phone: user.user_metadata?.phone || '',
    avatar: user.user_metadata?.avatar_url || '',
    provider: user.app_metadata?.provider || 'email',
  };
}
