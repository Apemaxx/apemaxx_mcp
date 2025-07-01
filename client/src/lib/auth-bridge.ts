import { supabase } from './supabase';
import { authService } from './auth';

// Bridge function to get JWT token from Supabase session
export async function getJWTFromSupabaseSession() {
  try {
    // Get the current Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.access_token) {
      console.error('No valid Supabase session found');
      return null;
    }

    // Exchange Supabase token for our app JWT
    const response = await fetch('/api/auth/supabase-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        supabaseToken: session.access_token 
      }),
    });

    if (!response.ok) {
      console.error('Failed to exchange tokens');
      return null;
    }

    const data = await response.json();
    
    // Set the JWT token in authService
    localStorage.setItem('auth-token', data.token);
    
    return data.token;
  } catch (error) {
    console.error('Error bridging authentication:', error);
    return null;
  }
}

// Initialize the auth bridge when needed
export async function initializeAuthBridge() {
  const token = await getJWTFromSupabaseSession();
  if (token) {
    console.log('Successfully bridged Supabase authentication to Express API');
    return true;
  }
  return false;
}