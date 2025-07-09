-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  hire_date DATE,
  salary NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Users can view their team members" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their team members" 
ON public.team_members 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their team members" 
ON public.team_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();