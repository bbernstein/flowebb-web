#!/bin/bash

export PAGER=""

set -e

# Configuration
ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

# Load environment-specific variables
ENV_FILE=".env.$ENVIRONMENT"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

# show the environment variables
echo "NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"

# Build the Next.js application
echo "Building Next.js application..."
cd frontend
npm ci
npm run build

# Sync the build output to S3
echo "Deploying to S3..."
aws s3 sync out/ "s3://${FRONTEND_BUCKET_NAME}" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "404.html"

# Sync HTML files with different cache settings
aws s3 sync out/ "s3://${FRONTEND_BUCKET_NAME}" \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "index.html" \
    --include "404.html"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo "Waiting for invalidation ${INVALIDATION_ID} to complete..."
aws cloudfront wait invalidation-completed \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --id "${INVALIDATION_ID}"

echo "Deployment complete!"
