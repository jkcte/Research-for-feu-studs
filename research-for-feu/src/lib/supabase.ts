import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dmxsmppnlxiczcuimpba.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRteHNtcHBubHhpY3pjdWltcGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NjY2MDQsImV4cCI6MjA0NzU0MjYwNH0.ZB767mBe1C6gOBYAXTbWjylD5DpF0Nyz5U98L_rDVeE"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)