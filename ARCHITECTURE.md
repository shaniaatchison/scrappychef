# ScrappyChef Architecture Plan

## Overview
ScrappyChef is a Progressive Web App (PWA) designed to reduce household food waste by tracking ingredients and suggesting recipes based on what's available and expiring soon.

## Tech Stack (Zero-Budget)
- **Frontend Framework**: [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend-as-a-Service**: [Supabase](https://supabase.com/)
  - **Database**: PostgreSQL
  - **Authentication**: Supabase Auth (Email/Password, Social)
  - **Storage**: Supabase Storage (for images)
- **PWA Features**: `vite-plugin-pwa`
- **Hosting**: Vercel (Free Tier) or Netlify (Free Tier)
- **API (Recipes)**: TBD (Considering Spoonacular or Edamam free tiers, or local dataset)

## Data Model (Supabase)

### `profiles`
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique)
- `avatar_url` (text)
- `updated_at` (timestamp)

### `ingredients`
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles.id)
- `name` (text)
- `quantity` (float)
- `unit` (text)
- `expiry_date` (date)
- `created_at` (timestamp)

### `recipes`
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `instructions` (text)
- `image_url` (text)
- `ingredients` (jsonb) - List of required ingredients
- `created_at` (timestamp)

### `saved_recipes`
- `user_id` (uuid, primary key, references profiles.id)
- `recipe_id` (uuid, primary key, references recipes.id)
- `saved_at` (timestamp)

## Infrastructure Plan
1. **GitHub Repository**: Primary source of truth.
2. **Supabase Project**: Database and Auth.
3. **Vercel**: Continuous Deployment.
4. **PWA**: Manifest and Service Worker for offline-first capabilities.

## MVP Implementation Phases
1. **Phase 1: Setup & Auth** - Initialize project, configure Supabase, implement Login/Signup.
2. **Phase 2: Ingredient Inventory** - Create/Read/Update/Delete (CRUD) for household ingredients.
3. **Phase 3: Recipe Logic** - Simple matching algorithm between inventory and recipe database.
4. **Phase 4: PWA & UI Polish** - Service worker setup, mobile optimization, and "Add to Home Screen" support.
