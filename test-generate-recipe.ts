const ingredients = ["wilted spinach", "stale bread"];
const url = "https://iynmkpdqvbyrrdbvqrra.supabase.co/functions/v1/generate-recipe";

async function test() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients })
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
