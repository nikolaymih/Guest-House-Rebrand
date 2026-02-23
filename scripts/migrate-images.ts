// scripts/migrate-images.ts
// Run: npx ts-node --project tsconfig.json scripts/migrate-images.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GALLERY_ROOT =
  "/home/nikolaymih11/webstormprojects/Guest-house-UI/src/assets/images/gallery";

const CATEGORY_MAP: Record<string, string> = {
  garden: "garden",
  tavern: "tavern",
  spa: "spa",
  rooms: "rooms",
};

async function migrate() {
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
  process.stdout.write("Migration complete.\n");
}

migrate().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
