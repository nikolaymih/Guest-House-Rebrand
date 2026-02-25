// src/types/index.ts

export type GalleryCategory = "garden" | "tavern" | "spa" | "rooms" | "overview" | "welcome";

export interface GalleryImage {
  id: string;
  category: GalleryCategory;
  storage_path: string;
  display_order: number;
  created_at: string;
  url?: string;
}

export interface Landmark {
  id: string;
  slug: string;
  name_bg: string;
  name_en: string;
  description_bg: string;
  description_en: string;
  distance: string;
  storage_path: string | null;
  display_order: number;
  created_at: string;
  url?: string; // resolved at runtime
}

export interface PricingRow {
  id: string;
  guest_count: number;
  daily_rate_eur: number;
  two_day_eur: number;
  three_plus_eur: number;
  spa_variant: boolean;
  updated_at: string;
}

export interface Reservation {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface AccommodationContent {
  id: string;
  about_heading_bg: string;
  about_heading_en: string;
  about_p1_bg: string;
  about_p1_en: string;
  about_p2_bg: string;
  about_p2_en: string;
  features_heading_bg: string;
  features_heading_en: string;
  updated_at: string;
}

export interface AccommodationFeature {
  id: string;
  label_bg: string;
  label_en: string;
  display_order: number;
}

export interface HomeContent {
  id: string;
  hero_title_bg: string;
  hero_title_en: string;
  hero_subtitle_bg: string;
  hero_subtitle_en: string;
  about_heading_bg: string;
  about_heading_en: string;
  about_p1_bg: string;
  about_p1_en: string;
  about_p2_bg: string;
  about_p2_en: string;
  about_p3_bg: string;
  about_p3_en: string;
  amenities_heading_bg: string;
  amenities_heading_en: string;
  updated_at: string;
}

export interface HomeAmenity {
  id: string;
  label_bg: string;
  label_en: string;
  display_order: number;
}

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  favicon_url: string | null;
  updated_at: string;
}
