#!/bin/bash

# Deployment script for ScrappyChef Edge Functions
# Requires SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_ID

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "Error: SUPABASE_PROJECT_ID is not set."
  exit 1
fi

echo "Deploying Edge Functions to project $SUPABASE_PROJECT_ID..."

FUNCTIONS=("generate-recipe" "scrappy-score-card" "stripe-webhook" "process-video-queue" "trigger-video-render" "create-checkout-session")

for func in "${FUNCTIONS[@]}"; do
  echo "Deploying $func..."
  npx -y supabase functions deploy "$func" --project-ref "$SUPABASE_PROJECT_ID"
done

echo "All functions deployed successfully."
