import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    'https://bzbkqrysplibgxofatsr.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6YmtxcnlzcGxpYmd4b2ZhdHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2ODg5MDQsImV4cCI6MjAzMzI2NDkwNH0.fiYHB9dU9CNZYKkGXxSz7X7rPctYxgh1LrgV0eS5x8s'
);
