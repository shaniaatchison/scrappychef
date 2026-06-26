const migrations = [
  "20260621000001_premium_features.sql",
  "20260623000000_viral_loop.sql",
  "20260625000000_automated_video.sql",
  "20260625000001_video_trigger.sql",
  "20260625000002_video_cron.sql",
  "20260626000000_premium_fixes.sql"
];

const functionUrl = "https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/run-sql";

async function run() {
  for (const migration of migrations) {
    console.log(`Running migration: ${migration}`);
    const sql = await Deno.readTextFile(`supabase/migrations/${migration}`);
    const resp = await fetch(functionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql })
    });
    const result = await resp.json();
    if (resp.ok) {
      console.log(`Migration ${migration} successful`);
    } else {
      console.error(`Migration ${migration} failed:`, result.error);
    }
  }
}

run();
