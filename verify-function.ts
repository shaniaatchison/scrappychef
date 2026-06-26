import * as fs from 'fs';

// Mock data
const mockData = {
    score: 732,
    username: "tester",
    moneySaved: 124.50,
    lbsDiverted: 12.2,
    streak: 5,
    mealsCooked: 15,
    referralCode: "SCRAPPY123",
    rank: "pro"
};

// Logic from supabase/functions/scrappy-score-card/index.ts
async function generateSvg(data: any) {
    const { score, username, moneySaved, lbsDiverted, streak, mealsCooked, referralCode, rank } = data;
    return `
      <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1080" height="1080" fill="#ecfdf5" />
        <rect x="20" y="20" width="1040" height="1040" fill="none" stroke="#10b981" stroke-width="40" />
        
        <text x="80" y="120" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b">ScrappyChef</text>
        
        <text x="540" y="300" font-family="sans-serif" font-weight="bold" font-size="80" fill="#065f46" text-anchor="middle">MY SCRAPPY SCORE</text>
        
        <text x="540" y="600" font-family="sans-serif" font-weight="bold" font-size="360" fill="#10b981" text-anchor="middle">${score}</text>
        
        <text x="540" y="700" font-family="sans-serif" font-size="50" fill="#064e3b" text-anchor="middle">I saved $${moneySaved.toFixed(2)} with ScrappyChef!</text>
        
        <text x="540" y="770" font-family="sans-serif" font-weight="bold" font-size="60" fill="#10b981" text-anchor="middle">RANK: ${rank.toUpperCase()}</text>
        
        <g transform="translate(270, 820)">
          <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b" text-anchor="middle">${lbsDiverted.toFixed(1)}</text>
          <text x="0" y="50" font-family="sans-serif" font-size="40" fill="#6b7280" text-anchor="middle">Lbs Saved</text>
        </g>
        
        <g transform="translate(540, 820)">
          <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b" text-anchor="middle">${streak}d</text>
          <text x="0" y="50" font-family="sans-serif" font-size="40" fill="#6b7280" text-anchor="middle">Streak</text>
        </g>
        
        <g transform="translate(810, 820)">
          <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="60" fill="#064e3b" text-anchor="middle">${mealsCooked}</text>
          <text x="0" y="50" font-family="sans-serif" font-size="40" fill="#6b7280" text-anchor="middle">Meals</text>
        </g>
        
        <rect x="0" y="960" width="1080" height="120" fill="#10b981" />
        <text x="540" y="1035" font-family="sans-serif" font-weight="bold" font-size="50" fill="white" text-anchor="middle">USE CODE: ${referralCode}</text>
      </svg>
    `;
}

async function runTest() {
  const svg = await generateSvg(mockData);
  fs.writeFileSync("test-card.svg", svg);
  console.log("SVG generated to test-card.svg");
}

runTest();
