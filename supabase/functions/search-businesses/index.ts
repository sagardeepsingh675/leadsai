import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Maps API Key
const GOOGLE_API_KEY = 'AIzaSyADEgFt9jr__ej7efOtmA0oN015Os092w4';

// Get place details (phone, website)
async function getPlaceDetails(placeId: string): Promise<any> {
    const fields = 'formatted_phone_number,international_phone_number,website,url,opening_hours';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK') {
            return data.result;
        }
    } catch (e) {
        console.error('Place details error:', e);
    }
    return null;
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { country, state, city, businessType, limit = 15 } = await req.json();

        if (!country || !businessType) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: country, businessType' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Build search query
        const location = [city, state, country].filter(Boolean).join(', ');
        const query = `${businessType} in ${location}`;

        console.log(`Searching: ${query}`);

        // Use Text Search API
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

        const searchResponse = await fetch(textSearchUrl);
        const searchData = await searchResponse.json();

        console.log(`Text Search status: ${searchData.status}, results: ${searchData.results?.length || 0}`);

        if (searchData.status !== 'OK') {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: searchData.error_message || searchData.status,
                    businesses: []
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get limited results and fetch details for each
        const places = searchData.results.slice(0, limit);

        // Fetch details for each place (phone, website)
        const businesses = await Promise.all(places.map(async (place: any) => {
            const details = await getPlaceDetails(place.place_id);

            const website = details?.website || null;
            const phone = details?.formatted_phone_number || details?.international_phone_number || null;

            return {
                name: place.name,
                type: businessType,
                address: place.formatted_address || '',
                city: city || '',
                state: state || '',
                country: country,
                phone: phone,
                website: website,
                hasWebsite: !!website,
                hasSsl: website?.startsWith('https') || false,
                websiteScore: !website ? 'no_website' : (website.startsWith('https') ? 'good' : 'poor'),
                lat: place.geometry?.location?.lat,
                lng: place.geometry?.location?.lng,
                googlePlaceId: place.place_id,
                googleMapsUrl: details?.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                rating: place.rating || null,
                reviewCount: place.user_ratings_total || 0,
                openingHours: details?.opening_hours?.weekday_text || null,
                types: place.types || [],
            };
        }));

        console.log(`Returning ${businesses.length} businesses with details`);

        return new Response(
            JSON.stringify({
                success: true,
                count: businesses.length,
                query,
                businesses
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
