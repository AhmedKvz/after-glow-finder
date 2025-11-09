-- Create enum for helper/vendor roles
CREATE TYPE public.marketplace_role AS ENUM (
  'general_helper',
  'wellness_support',
  'dj_musician',
  'event_staff',
  'vendor_store',
  'props_rental'
);

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM (
  'draft',
  'pending',
  'approved',
  'rejected'
);

-- Create helper_applications table
CREATE TABLE public.helper_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type marketplace_role NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  
  -- Basic profile info
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  city TEXT NOT NULL,
  coverage_area TEXT,
  category_tags TEXT[] DEFAULT '{}',
  
  -- Availability
  availability_24_7 BOOLEAN DEFAULT false,
  availability_schedule JSONB, -- {monday: [{start: '09:00', end: '17:00'}], ...}
  
  -- Pricing
  price_range TEXT,
  hourly_rate NUMERIC(10, 2),
  session_rate NUMERIC(10, 2),
  
  -- Contact & Social
  phone TEXT,
  email TEXT,
  instagram TEXT,
  website TEXT,
  
  -- Role-specific data (flexible JSONB for different role requirements)
  role_data JSONB DEFAULT '{}',
  
  -- Images/Gallery
  gallery_urls TEXT[] DEFAULT '{}',
  
  -- Admin notes
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.helper_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.helper_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can create applications"
ON public.helper_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own draft applications
CREATE POLICY "Users can update their own draft applications"
ON public.helper_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'draft')
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.helper_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update any application
CREATE POLICY "Admins can update applications"
ON public.helper_applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_helper_applications_updated_at
BEFORE UPDATE ON public.helper_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_helper_applications_user_id ON public.helper_applications(user_id);
CREATE INDEX idx_helper_applications_status ON public.helper_applications(status);
CREATE INDEX idx_helper_applications_role_type ON public.helper_applications(role_type);