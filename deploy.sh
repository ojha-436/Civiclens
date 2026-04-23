#!/usr/bin/env bash
# CivicLens India — One-command GCP deployment
# Usage: ./deploy.sh [project-id]
set -e

PROJECT_ID="${1:-civiclens-india}"

echo "🗳️  CivicLens India deployment starting..."
echo "   Project: $PROJECT_ID"
echo ""

# Check prerequisites
command -v firebase >/dev/null 2>&1 || {
  echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
  exit 1
}

# Login check
firebase projects:list >/dev/null 2>&1 || {
  echo "→ Logging in to Firebase..."
  firebase login
}

# Select project
echo "→ Selecting project $PROJECT_ID..."
firebase use "$PROJECT_ID" 2>/dev/null || {
  echo "   Project not found in local config. Adding..."
  firebase use --add "$PROJECT_ID"
}

# Deploy
echo "→ Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "   Your site is live at: https://${PROJECT_ID}.web.app"
echo ""
echo "Optional next step — enable the Gemini assistant (Mumbai region for low latency):"
echo "   cd deploy && gcloud functions deploy askGemini \\"
echo "     --gen2 --runtime=nodejs20 --trigger-http --allow-unauthenticated \\"
echo "     --region=asia-south1 --set-env-vars GEMINI_API_KEY=YOUR_KEY \\"
echo "     --entry-point=askGemini"
