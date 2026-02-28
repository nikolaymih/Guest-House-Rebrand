CREATE TABLE promotions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title_bg      text NOT NULL,
  title_en      text NOT NULL,
  description_bg text NOT NULL,
  description_en text NOT NULL,
  price         text NOT NULL,
  valid_from    date NOT NULL,
  valid_to      date NOT NULL,
  storage_path  text,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
