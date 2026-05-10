import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get user');
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setError(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // =========================
  // SIGN UP WITH EMAIL
  // =========================
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ) => {
    try {
      setError(null);

      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/login`
          : 'http://localhost:3000/auth/login';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,

          data: {
            name,
            phone,
          },
        },
      });

      if (error) {

  if (
    error.message
      .toLowerCase()
      .includes("already")
  ) {

    throw new Error(
      "Looks like your account is already registered. Try logging in."
    );
  }

  throw error;
}


// Supabase silent existing-user case
if (
  data?.user &&
  data.user.identities?.length === 0
) {

  throw new Error(
    "Looks like your account is already registered. Try logging in."
  );
}

      return {
        success: true,
        user: data.user,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sign up failed';

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // =========================
  // SIGN IN WITH EMAIL
  // =========================
  const signInWithEmail = async (
    email: string,
    password: string
  ) => {
    try {
      setError(null);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      setUser(data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sign in failed';

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // =========================
  // GOOGLE SIGN IN
  // =========================
  const signInWithGoogle = async () => {
    try {
      setError(null);

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${
              typeof window !== 'undefined'
                ? window.location.origin
                : ''
            }/auth/callback`,
          },
        });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Google sign in failed';

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================
  const resetPassword = async (email: string) => {
    try {
      setError(null);

      const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${
            typeof window !== 'undefined'
              ? window.location.origin
              : ''
          }/auth/reset-password`,
        });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Password reset request failed';

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // =========================
  // UPDATE PASSWORD
  // =========================
  const updatePassword = async (
    newPassword: string
  ) => {
    try {
      setError(null);

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Password update failed';

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // =========================
  // SIGN OUT
  // =========================
  const signOut = async () => {
    try {
      setError(null);

      const { error } =
        await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);

      return {
        success: true,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Sign out failed';

      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    user,
    loading,
    error,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    signOut,
  };
}