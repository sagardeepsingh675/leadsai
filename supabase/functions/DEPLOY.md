# Deploy Edge Function with Google Places API

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2: Login and Link Project

```bash
npx supabase login
npx supabase link --project-ref glxynaotrpucpjfcgjpx
```

## Step 3: Set Google Maps API Key as Secret

```bash
npx supabase secrets set GOOGLE_MAPS_API_KEY=AIzaSyADEgFt9jr__ej7efOtmA0oN015Os092w4
```

## Step 4: Deploy the Function

```bash
npx supabase functions deploy search-businesses
```

## Test the Function

```bash
curl -X POST https://glxynaotrpucpjfcgjpx.supabase.co/functions/v1/search-businesses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdseHluYW90cnB1Y3BqZmNnanB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNjE3MTMsImV4cCI6MjA4MjczNzcxM30.Nmuj56G3hm2plI_Ej_eusYpaVCOa8uwq56Tv9AQEIeE" \
  -H "Content-Type: application/json" \
  -d '{"country":"India","state":"Haryana","city":"Gurugram","businessType":"restaurant","limit":10}'
```

## What Data You'll Get

For each business:
- Name
- Full address
- Phone number
- Website URL
- Google rating (1-5 stars)
- Number of reviews
- Opening hours
- Google Maps link
- Website SSL status
