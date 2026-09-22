
CREATE TYPE public.report_type AS ENUM ('lost','found');
CREATE TYPE public.report_status AS ENUM ('active','matched','claimed','resolved');

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type public.report_type NOT NULL,
  item_name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  image_url text,
  location text NOT NULL,
  item_date date NOT NULL,
  item_time text,
  identifying_details text,
  contact_name text NOT NULL,
  contact_email text,
  contact_phone text,
  status public.report_status NOT NULL DEFAULT 'active',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_type ON public.reports(report_type);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_date ON public.reports(item_date);
CREATE INDEX idx_reports_created ON public.reports(created_at DESC);

-- Column level grants: contact_email / contact_phone stay private
GRANT SELECT (id, report_type, item_name, category, description, image_url, location, item_date, item_time, identifying_details, contact_name, status, is_demo, created_at) ON public.reports TO anon, authenticated;
GRANT INSERT ON public.reports TO anon, authenticated;
GRANT UPDATE (status) ON public.reports TO anon, authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit reports" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update report status" ON public.reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  claimant_name text NOT NULL,
  claimant_email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_claims_report ON public.claims(report_id);

GRANT INSERT ON public.claims TO anon, authenticated;
GRANT ALL ON public.claims TO service_role;

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a claim" ON public.claims FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.reports (report_type, item_name, category, description, location, item_date, item_time, identifying_details, contact_name, contact_email, is_demo) VALUES
('lost','Black Wallet','Wallet / Money','Black leather wallet containing a college ID and a few cards.','Central Library','2026-09-22','Around 3 PM','College ID inside with name Rahul S.','Rahul Sharma','rahul.demo@example.com',true),
('found','Black Wallet','Wallet / Money','Found a black leather wallet with a college ID inside near the reading area.','Central Library','2026-09-22','Around 5 PM','Leather, has a college ID card','Ananya Verma','ananya.demo@example.com',true),
('lost','Blue Hydro Flask','Accessories','Blue metal water bottle with a dented cap and a mountain sticker.','Sports Complex','2026-09-20','Evening','Mountain sticker on the side','Imran Khan','imran.demo@example.com',true),
('found','Silver Laptop Charger','Electronics','65W silver laptop charger left on a desk in Lab 3.','Computer Lab 3','2026-09-21','Morning','Frayed cable near the plug','Priya Nair','priya.demo@example.com',true);
