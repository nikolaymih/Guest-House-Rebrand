-- Seed home_content with current site texts
-- Run AFTER create-home-tables.sql
INSERT INTO home_content (
  id,
  hero_title_bg,         hero_title_en,
  hero_subtitle_bg,      hero_subtitle_en,
  about_heading_bg,      about_heading_en,
  about_p1_bg,           about_p1_en,
  about_p2_bg,           about_p2_en,
  about_p3_bg,           about_p3_en,
  amenities_heading_bg,  amenities_heading_en,
  updated_at
) VALUES (
  1,
  'Становец',
  'Stanovets',

  'Уютна къща за гости сред природата. Спа зона, механа, красива градина и незабравима почивка.',
  'A cozy guest house in nature. Spa zone, tavern, beautiful garden and unforgettable relaxation.',

  'Добре дошли в Становец',
  'Welcome to Stanovets',

  'Къщата за гости Становец предлага комфортно настаняване за до 12 гости. Разполагаме с 4 спални, 4 бани, просторна всекидневна и напълно оборудвана кухня.',
  'Guest House Stanovets offers comfortable accommodation for up to 12 guests. We have 4 bedrooms, 4 bathrooms, a spacious living room and a fully equipped kitchen.',

  'Насладете се на СПА зоната с вана за хидромасаж, сауна и фитнес уреди, или прекарайте вечерта в нашата уютна механа с автентична атмосфера.',
  'Enjoy the spa zone with a hydromassage tub, sauna and fitness equipment, or spend the evening in our cozy tavern with an authentic atmosphere.',

  'Намираме се в живописен район, близо до природни забележителности и исторически обекти.',
  'We are situated in a picturesque area, close to natural landmarks and historical sites.',

  'Удобства',
  'Amenities',

  now()
)
ON CONFLICT (id) DO UPDATE SET
  hero_title_bg         = EXCLUDED.hero_title_bg,
  hero_title_en         = EXCLUDED.hero_title_en,
  hero_subtitle_bg      = EXCLUDED.hero_subtitle_bg,
  hero_subtitle_en      = EXCLUDED.hero_subtitle_en,
  about_heading_bg      = EXCLUDED.about_heading_bg,
  about_heading_en      = EXCLUDED.about_heading_en,
  about_p1_bg           = EXCLUDED.about_p1_bg,
  about_p1_en           = EXCLUDED.about_p1_en,
  about_p2_bg           = EXCLUDED.about_p2_bg,
  about_p2_en           = EXCLUDED.about_p2_en,
  about_p3_bg           = EXCLUDED.about_p3_bg,
  about_p3_en           = EXCLUDED.about_p3_en,
  amenities_heading_bg  = EXCLUDED.amenities_heading_bg,
  amenities_heading_en  = EXCLUDED.amenities_heading_en,
  updated_at            = now();

-- Seed home_amenities
-- Clear existing rows first (idempotent re-run)
DELETE FROM home_amenities;

INSERT INTO home_amenities (label_bg, label_en, display_order) VALUES
  ('4 спални, 4 бани',                  '4 bedrooms, 4 bathrooms',              0),
  ('До 12 гости',                        'Up to 12 guests',                      1),
  ('СПА зона (хидромасаж, сауна, фитнес)', 'Spa zone (hydromassage, sauna, fitness)', 2),
  ('Механа с автентична атмосфера',     'Tavern with authentic atmosphere',      3),
  ('Просторна градина',                  'Spacious garden',                      4),
  ('Напълно оборудвана кухня',           'Fully equipped kitchen',               5),
  ('Безплатен паркинг',                  'Free parking',                         6),
  ('Wi-Fi',                              'Wi-Fi',                                7);
