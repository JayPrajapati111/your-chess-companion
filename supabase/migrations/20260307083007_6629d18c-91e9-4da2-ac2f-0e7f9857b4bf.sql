ALTER TABLE public.profiles ADD COLUMN completed_lessons text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN completed_practices text[] DEFAULT '{}';