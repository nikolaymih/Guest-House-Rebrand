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
