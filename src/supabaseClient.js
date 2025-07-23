import { createClient } from '@supabase/supabase-js';

// 🔐 Replace these with your actual values:
const supabaseUrl = 'https://jyxwictvglioiwcorjoj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eHdpY3R2Z2xpb2l3Y29yam9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTc1NzAsImV4cCI6MjA2ODY5MzU3MH0.kUu_2sxCO_dwkWsceUXXITJW5-9c7xKaiTG_aFSF5Ro';

export const supabase = createClient(supabaseUrl, supabaseKey);
