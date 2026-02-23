// scripts/migrate-images.ts
// Run: npx ts-node --project tsconfig.json scripts/migrate-images.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OLD_UI_ROOT =
  "/home/nikolaymih11/webstormprojects/Guest-house-UI/src/assets/images";
const GALLERY_ROOT = path.join(OLD_UI_ROOT, "gallery");

// ── 1. Regular gallery categories ────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  garden: "garden",
  tavern: "tavern",
  spa: "spa",
  rooms: "rooms",
};

// ── 2. Hero carousel images (overview category) ───────────────────────────────
const HERO_IMAGES = [
  { file: "mainPage.jpg", category: "overview" },
  { file: "korica.jpg", category: "overview" },
  { file: "3.Carousel.jpg", category: "overview" },
];

// ── 3. Welcome section images (welcome category) ──────────────────────────────
const WELCOME_IMAGES = [
  { file: "3.Carousel.jpg", category: "welcome" },
  { file: "comfort2.jpg", category: "welcome" },
  { file: "spa2.jpg", category: "welcome" },
];

// ── 4. Landmark images ────────────────────────────────────────────────────────
const LANDMARK_IMAGES: Array<{ file: string; slug: string }> = [
  { file: "monastery.jpg", slug: "benediktinski-manastir" },
  { file: "pliska.jpeg", slug: "pliska" },
  { file: "shumenska-krepost.jpeg", slug: "shumenska-krepost" },
  { file: "zandana.jpg", slug: "peshtera-zandana" },
  { file: "madarski-konnik-цопъ.jpg", slug: "madarski-konnik" },
  { file: "skalenMonastery.jpg", slug: "hankrumovski-skalen-manastir" },
  { file: "osmar.jpg", slug: "okoto-na-osmar" },
  { file: "preslav.jpg", slug: "veliki-preslav" },
];

async function migrateGalleryCategories() {
  for (const [folder, category] of Object.entries(CATEGORY_MAP)) {
    const dir = path.join(GALLERY_ROOT, folder);
    if (!fs.existsSync(dir)) {
      process.stdout.write(`Skipping missing folder: ${dir}\n`);
      continue;
    }

    const files = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    process.stdout.write(`Uploading ${files.length} files from ${folder}...\n`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dir, file);
      const buffer = fs.readFileSync(filePath);
      const storagePath = `${category}/${file}`;

      const { error } = await supabase.storage
        .from("gallery")
        .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

      if (error) {
        process.stdout.write(`Error uploading ${file}: ${error.message}\n`);
        continue;
      }

      await supabase.from("gallery_images").insert({
        category,
        storage_path: storagePath,
        display_order: i,
      });

      process.stdout.write(`Uploaded: ${storagePath}\n`);
    }
  }
}

async function migrateHeroImages() {
  process.stdout.write("\nUploading hero carousel images (overview)...\n");
  for (const { file, category } of HERO_IMAGES) {
    const filePath = path.join(OLD_UI_ROOT, file);
    if (!fs.existsSync(filePath)) {
      process.stdout.write(`Missing file: ${filePath}\n`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const storagePath = `${category}/${file}`;

    const { error } = await supabase.storage
      .from("gallery")
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

    if (error) {
      process.stdout.write(`Error uploading ${file}: ${error.message}\n`);
      continue;
    }

    await supabase.from("gallery_images").insert({
      category,
      storage_path: storagePath,
      display_order: 0,
    });

    process.stdout.write(`Uploaded hero: ${storagePath}\n`);
  }
}

async function migrateWelcomeImages() {
  process.stdout.write("\nUploading welcome section images...\n");
  for (const { file, category } of WELCOME_IMAGES) {
    const filePath = path.join(OLD_UI_ROOT, file);
    if (!fs.existsSync(filePath)) {
      process.stdout.write(`Missing file: ${filePath}\n`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const storagePath = `${category}/${file}`;

    const { error } = await supabase.storage
      .from("gallery")
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

    if (error) {
      process.stdout.write(`Error uploading ${file}: ${error.message}\n`);
      continue;
    }

    await supabase.from("gallery_images").insert({
      category,
      storage_path: storagePath,
      display_order: 0,
    });

    process.stdout.write(`Uploaded welcome: ${storagePath}\n`);
  }
}

async function migrateLandmarkImages() {
  process.stdout.write("\nUploading landmark images...\n");
  for (const { file, slug } of LANDMARK_IMAGES) {
    const filePath = path.join(OLD_UI_ROOT, file);
    if (!fs.existsSync(filePath)) {
      process.stdout.write(`Missing file: ${filePath}\n`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const storagePath = `landmarks/${file}`;

    const { error } = await supabase.storage
      .from("gallery")
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

    if (error) {
      process.stdout.write(`Error uploading ${file}: ${error.message}\n`);
      continue;
    }

    // upsert into landmark_images (one image per slug)
    await supabase
      .from("landmark_images")
      .upsert({ slug, storage_path: storagePath }, { onConflict: "slug" });

    process.stdout.write(`Uploaded landmark: ${storagePath} → ${slug}\n`);
  }
}

async function migrate() {
  await migrateGalleryCategories();
  await migrateHeroImages();
  await migrateWelcomeImages();
  await migrateLandmarkImages();
  process.stdout.write("\nMigration complete.\n");
}

migrate().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
