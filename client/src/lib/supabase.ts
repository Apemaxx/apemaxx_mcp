import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqmpupymchanohpfzglw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY2ODcsImV4cCI6MjA2NjUxMjY4N30.VnlHnThWyiSC4f2wX7iDl1wAmqiS0Fv0FowBTGmKa-8'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for type safety
export interface Profile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  avatar_url: string | null
  job_title: string | null
  company: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface WarehouseReceipt {
  id: string
  user_id: string
  receipt_number: string
  supplier_name: string
  total_pallets: number
  total_boxes: number
  total_crates: number
  category: string
  status: string
  received_date: string
  created_at: string
  updated_at: string
}

export interface WarehouseReceiptAttachment {
  id: string
  warehouse_receipt_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

// Auth user type for compatibility
export interface AuthUser {
  id: string
  email: string
  name?: string
}

// Get user profile function
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error.message)
      return null
    }

    return data
  } catch (error) {
    console.error('Profile fetch error:', error)
    return null
  }
}

// Update user profile function
export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating profile:', error.message)
      return false
    }

    return true
  } catch (error) {
    console.error('Profile update error:', error)
    return false
  }
}