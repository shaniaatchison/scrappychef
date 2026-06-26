# ScrappyChef 🍳

ScrappyChef is a zero-overhead Progressive Web App (PWA) that helps households eliminate food waste.

## Vision
To reach $10,000 MRR within 6 months by converting 1,000 active users into $9.99/month premium members using organic growth.

## Setup Instructions
1. **Clone the repository.**
2. **Install dependencies**: `npm install`
3. **Environment Variables**:
   - Create a `.env` file in the root directory.
   - Copy the contents of `.env.example` into `.env`.
   - Replace the placeholders with your actual Supabase credentials from the [Supabase Dashboard](https://app.supabase.com/).
4. **Supabase Database Setup**:
   - Go to the SQL Editor in your Supabase project.
   - Run the contents of `supabase/migrations/20260611000000_init.sql` to set up the tables and Row Level Security.
5. **Run the development server**: `npm run dev`

## Core Features
- **Smart Inventory**: Track what's in your fridge and pantry.
- **Expiry Alerts**: Get notified before food goes bad.
- **Waste-Free Recipes**: Suggested recipes based on ingredients you already have.
- **Offline Access**: Use the app even without an internet connection.

## Built With
- React + Vite
- Tailwind CSS (v4)
- Supabase (Auth & Database)
- Lucide React (Icons)
- vite-plugin-pwa
