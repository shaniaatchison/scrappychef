import fs from 'fs';
import path from 'fs';

const migrations = [
  "20260621000001_premium_features.sql",
  "20260625000000_automated_video.sql",
  "20260625000001_video_trigger.sql",
  "20260625000002_video_cron.sql",
  "20260626000000_premium_fixes.sql",
  "20260626000001_push_notifications.sql",
  "20260626000002_auto_video_cron.sql"
];

const functionUrl = "https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/run-sql";

async function run() {
  for (const migration of migrations) {
    console.log(`Checking/Running migration: ${migration}`);
    const sql = fs.readFileSync(`./supabase/migrations/${migration}`, 'utf8');
    try {
      const resp = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql })
      });
      const result = await resp.json();
      if (resp.ok) {
        console.log(`Migration ${migration} processed successfully.`);
      } else {
        console.error(`Migration ${migration} failed:`, result.error);
      }
    } catch (err) {
      console.error(`Error running ${migration}:`, err.message);
    }
  }
}

run();
