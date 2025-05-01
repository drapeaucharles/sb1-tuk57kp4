import { supabase } from './supabase';

export async function loginUser(email: string, password: string) {
  try {
    // First check if the user exists in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      throw new Error('Failed to check user existence');
    }

    if (!userData) {
      throw new Error('User not found');
    }

    // Then attempt to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        throw new Error('Incorrect password');
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Authentication failed');
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role as 'client' | 'host'
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function registerUser(email: string, password: string, role: 'client' | 'host') {
  try {
    // Check if user exists in our users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      throw new Error('Failed to check user existence');
    }

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role // Store role in auth metadata
        }
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user');
    }

    // Create the user profile
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        role,
        balance: 0
      }])
      .select('id, email, role')
      .single();

    if (profileError) {
      throw new Error('Failed to create user profile');
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role as 'client' | 'host'
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}