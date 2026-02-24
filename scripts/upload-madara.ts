// scripts/upload-madara.ts
// One-shot: upload the Madara Rider image with a clean ASCII filename
// Run: npx ts-node --project tsconfig.json scripts/upload-madara.ts
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOURCE = path.join(
  "/home/nikolaymih11/webstormprojects/Guest-house-UI/src/assets/images",
  "madarski-konnik-цопъ.jpg"
);
const STORAGE_PATH = "landmarks/madarski-konnik.jpg";
const SLUG = "madarski-konnik";

async function run() {
  if (!fs.existsSync(SOURCE)) {
    process.stderr.write(`Source file not found: ${SOURCE}\n`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(SOURCE);

  const { error } = await supabase.storage
    .from("gallery")
    .upload(STORAGE_PATH, buffer, { contentType: "image/jpeg", upsert: true });

  if (error) {
    process.stderr.write(`Upload failed: ${error.message}\n`);
    process.exit(1);
  }

  await supabase
    .from("landmark_images")
    .upsert({ slug: SLUG, storage_path: STORAGE_PATH }, { onConflict: "slug" });

  process.stdout.write(`Done — uploaded as ${STORAGE_PATH}\n`);
}

run().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
