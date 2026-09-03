-- Step 1/2: add enum value only (must commit before use)
-- Run this alone first in Supabase SQL Editor, then run 20260815000006_waitlist.sql

alter type public.application_status add value if not exists 'waitlisted';
