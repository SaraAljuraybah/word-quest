-- Username support for immediate game-style registration.
-- Run this once if profiles.username does not exist.

alter table public.profiles
  add column if not exists username text;

update public.profiles
set username = coalesce(nullif(trim(username), ''), 'لاعب ورد كويست')
where username is null
   or trim(username) = '';

notify pgrst, 'reload schema';
