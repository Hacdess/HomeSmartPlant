-- Copy vào query editor trên supabase để gen bảng

-- create table public.users (
--   user_id uuid default gen_random_uuid() primary key,
--   email text not null unique,
--   telegram_id text not null unique,
--   phone text not null unique,
--   password text not null,
--   full_name text not null,
--   user_name text not null unique,
--   notify boolean default true,
--   created_at timestamp with time zone default now(),
--   updated_at timestamp with time zone default now()
--   constraint phone_format_check check (phone ~ '^\+?[0-9]{9,15}$')
-- );

-- create table public.sensor_limits (
--   user_id uuid references public.users(user_id) on delete cascade primary key,
  
--   temp_min float default 20 not null,
--   temp_max float default 50 not null,
  
--   humid_min float default 0 not null,
--   humid_max float default 100 not null,
  
--   soil_min float default 0 not null,
--   soil_max float default 100 not null,
  
--   light_min float default 0 not null,
--   light_max float default 100 not null,

--   water_level_min float default 0 not null,
--   water_level_max float default 1600 not null
-- );

-- create table public.sensor_records (
--   rec_id bigint generated always as identity primary key,
--   user_id uuid references public.users(user_id) on delete cascade not null,
--   temperature float not null,
--   humid float not null,
--   soil_moisture float not null,
--   light float not null,
--   water_level float not null,
--   recorded_at timestamp default now()
-- );

-- create table public.output_device (
--   user_id uuid references public.users(user_id) on delete cascade not null,
--   name text check (name in ('PUMP', 'GROW_LIGHT')) not null,
--   status boolean default false not null,
--   updated_at timestamp default now(),
--   primary key(user_id, name)
-- );

-- -- Bảng Logs
-- create table public.system_logs (
--   log_id bigint generated always as identity primary key,
--   user_id uuid references public.users(user_id) on delete cascade not null,
--   type text check (type in ('WARNING', 'AUTHENTICATE', 'DEVICE')) not null,
--   content text not null,
--   created_at timestamp default now()
-- );

-- -- map user and esp
-- create table public.user_esp (
--   esp_id text primary key, 
--   user_id uuid references public.users(user_id) on delete cascade not null,
--   created_at timestamp default now()
-- );

-- -- 4. TRIGGER (Tự động tạo dữ liệu khi INSERT vào public.users)
-- create or replace function public.handle_new_user()
-- returns trigger 
-- language plpgsql
-- as $$
-- begin
--   -- 1. Tạo giới hạn cảm biến mặc định
--   insert into public.sensor_limits(user_id) values (new.user_id);

--   -- 2. Tạo thiết bị mặc định
--   insert into public.output_device(user_id, name, status) values (new.user_id, 'PUMP', false);
--   insert into public.output_device(user_id, name, status) values (new.user_id, 'GROW_LIGHT', false);

--   -- 3. Ghi log khởi tạo
--   insert into public.system_logs (user_id, type, content) 
--   values (new.user_id, 'AUTHENTICATE', 'Đã tạo tài khoản');

--   return new;
-- end
-- $$;

-- -- Gắn trigger vào bảng users
-- create trigger on_user_created
--   after insert on public.users
--   for each row
--   execute procedure public.handle_new_user();

-- create extension if not exists pg_cron;
-- select cron.schedule(
--     'cleanup-old-sensor-data',
--     '0 0 * * *',
--     $$ 
--     delete from public.sensor_records where recorded_at < now() - interval '7 days';
--     delete from public.system_logs where created_at < now() - interval '7 days';
--     $$
-- );