import axios from 'axios';

const functionUrl = "https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/run-sql";

async function run() {
  const sql = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles';
  `;
  try {
    const resp = await axios.post(functionUrl, { sql });
    console.log(JSON.stringify(resp.data.result, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

run();
