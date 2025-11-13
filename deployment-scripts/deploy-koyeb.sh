#!/bin/bash

echo "🚀 Deploying Koyeb Frontend..."

cd koyeb-frontend

# Build the application
echo "📦 Building application..."
npm run build

# Deploy to Koyeb
echo "☁️  Deploying to Koyeb..."
koyeb service create \
  --name whatsapp-bot-frontend \
  --app whatsapp-bot \
  --port 3000:http \
  --env BACKEND_URL="https://takamiya.netlify.app" \
  --env KOYEB_API_KEY="zzk3hg68nuqafhoezbco6ckz15dzm4tvvekij4g202cow4oxufe5gv843yywfxx9" \
  --env NODE_ENV="production"

echo "✅ Koyeb Frontend deployment initiated!"

echo "🌐 Check status: https://app.koyeb.com/services"
