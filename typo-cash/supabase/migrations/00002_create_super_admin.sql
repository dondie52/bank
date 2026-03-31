-- Create super_admin user for admin@gmail.com
-- Supabase Auth UID: b74100a4-5a87-4c53-941f-5475e2267f25

INSERT INTO public.users (id, mobile_number, email, role, status, created_at)
VALUES (
  'b74100a4-5a87-4c53-941f-5475e2267f25',
  '+26700000000',
  'admin@gmail.com',
  'admin',
  'active',
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admin_users (user_id, first_name, last_name, role, is_active, permissions)
VALUES (
  'b74100a4-5a87-4c53-941f-5475e2267f25',
  'Admin',
  'User',
  'super_admin',
  true,
  '{"all": true}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
