
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles: admins can read all, users can read their own
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create dishes table
CREATE TABLE public.dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  ingredients TEXT NOT NULL DEFAULT '',
  price NUMERIC(8,2) NOT NULL DEFAULT 0,
  thumbnail TEXT NOT NULL DEFAULT '',
  model_ios TEXT NOT NULL DEFAULT '',
  model_android TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Everyone can read dishes
CREATE POLICY "Anyone can read dishes" ON public.dishes
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert dishes" ON public.dishes
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dishes" ON public.dishes
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dishes" ON public.dishes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON public.dishes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for dish assets
INSERT INTO storage.buckets (id, name, public) VALUES ('dish-assets', 'dish-assets', true);

CREATE POLICY "Public read dish assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'dish-assets');

CREATE POLICY "Admins can upload dish assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dish-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dish assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'dish-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dish assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'dish-assets' AND public.has_role(auth.uid(), 'admin'));
