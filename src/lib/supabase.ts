import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Demo mode: activates when URL is still the placeholder
const IS_DEMO =
  !supabaseUrl ||
  supabaseUrl === 'https://tu-proyecto.supabase.co' ||
  supabaseUrl.startsWith('https://tu-')

export const DEMO_MODE = IS_DEMO

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = IS_DEMO
  ? mockSupabase
  : createClient(supabaseUrl, supabaseAnonKey)
