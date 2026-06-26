#!/bin/bash

# Script to set secrets for ScrappyChef Edge Functions
# Requires SUPABASE_PROJECT_ID

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID is not set."
  exit 1
fi

echo "Setting secrets for project $SUPABASE_PROJECT_ID..."

# Usage: npx supabase secrets set KEY=VALUE --project-ref $SUPABASE_PROJECT_ID

echo "Ready to set secrets. You will be prompted for each one."

read -p "Enter GEMINI_API_KEY: " GEMINI_API_KEY
npx supabase secrets set GEMINI_API_KEY="$GEMINI_API_KEY" --project-ref "$SUPABASE_PROJECT_ID"

read -p "Enter STRIPE_SECRET_KEY: " STRIPE_SECRET_KEY
npx supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --project-ref "$SUPABASE_PROJECT_ID"

read -p "Enter STRIPE_WEBHOOK_SECRET: " STRIPE_WEBHOOK_SECRET
npx supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" --project-ref "$SUPABASE_PROJECT_ID"

read -p "Enter AYRSHARE_API_KEY: " AYRSHARE_API_KEY
npx supabase secrets set AYRSHARE_API_KEY="$AYRSHARE_API_KEY" --project-ref "$SUPABASE_PROJECT_ID"

read -p "Enter GITHUB_TOKEN: " GITHUB_TOKEN
npx supabase secrets set GITHUB_TOKEN="$GITHUB_TOKEN" --project-ref "$SUPABASE_PROJECT_ID"

echo "All secrets set."
