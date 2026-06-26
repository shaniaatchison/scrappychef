const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ingredients = ["wilted spinach", "stale bread"];
const prompt = `You are ScrappyChef, an expert in zero-waste cooking. 
Given these ingredients: ${ingredients.join(", ")}, 
generate a creative, delicious recipe that uses as many of them as possible.
Focus on avoiding waste.

IMPORTANT: Return ONLY a valid JSON object. No markdown, no extra text.`;

async function test() {
  try {
    console.log("Sending request...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Data:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
