-- 1. Create the tables

CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id text NOT NULL,
  product_name text NOT NULL,
  original_price numeric NOT NULL,
  fulfillment_cost numeric NOT NULL,
  quoted_value numeric NOT NULL,
  loss_reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  customer_notes text,
  recovered_revenue numeric DEFAULT 0,
  actual_cost numeric DEFAULT 0,
  recovery_expense numeric DEFAULT 0,
  selected_strategy text,
  ai_analysis text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scenarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  strategy text NOT NULL,
  selling_price numeric NOT NULL,
  fulfillment_cost numeric NOT NULL,
  recovery_expense numeric NOT NULL,
  conversion_probability numeric NOT NULL,
  gross_profit numeric NOT NULL,
  gross_margin numeric NOT NULL,
  expected_profit numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recovery_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  strategy text NOT NULL,
  scenario_data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. Set up Row Level Security (RLS)

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_attempts ENABLE ROW LEVEL SECURITY;

-- For this hackathon/demo, we'll create simple policies that allow anonymous access.
-- WARNING: In a real production app, you would require authentication (auth.uid() = user_id).

CREATE POLICY "Allow anonymous read access to opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to opportunities" ON public.opportunities FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access to opportunities" ON public.opportunities FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access to scenarios" ON public.scenarios FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to scenarios" ON public.scenarios FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to recovery_attempts" ON public.recovery_attempts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to recovery_attempts" ON public.recovery_attempts FOR INSERT WITH CHECK (true);
