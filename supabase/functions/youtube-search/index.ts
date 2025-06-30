
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery, type = 'video', maxResults = 25 } = await req.json()
    
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      throw new Error('YouTube API key not configured')
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=${type}&maxResults=${maxResults}&key=${apiKey}`
    
    const response = await fetch(searchUrl)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'YouTube API request failed')
    }

    // Transform the data to match our expected format
    const transformedData = data.items?.map((item: any) => ({
      videoId: item.id.videoId || item.id.channelId,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      authorId: item.snippet.channelId,
      published: Math.floor(new Date(item.snippet.publishedAt).getTime() / 1000),
      lengthSeconds: 0, // We'll need a separate API call for video details
      viewCount: 0,
      videoThumbnails: [
        { url: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url, quality: 'medium' }
      ]
    })) || []

    return new Response(
      JSON.stringify(transformedData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('YouTube API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
