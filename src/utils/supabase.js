import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Replace these with your actual Supabase project URL and anon key from the Supabase dashboard
// Go to Project Settings -> API to find these values

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Example Usage:
 * 
 * import { supabase } from '../utils/supabase';
 * 
 * // Fetch data
 * const { data, error } = await supabase.from('opportunities').select('*');
 * 
 * // Insert data
 * const { data, error } = await supabase.from('opportunities').insert([{ ...newOpportunity }]);
 */
