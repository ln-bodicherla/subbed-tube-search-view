
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('YouTube channel function called with method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { channelId, maxResults = 10 } = await req.json()
    console.log('Channel parameters:', { channelId, maxResults })
    
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      console.error('YouTube API key not found in environment')
      throw new Error('YouTube API key not configured')
    }

    console.log('Making request to YouTube API for channel videos...')
    // Get channel videos
    const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`
    
    const response = await fetch(videosUrl)
    const data = await response.json()

    console.log('YouTube API response status:', response.status)

    if (!response.ok) {
      console.error('YouTube API error:', data)
      throw new Error(data.error?.message || 'YouTube API request failed')
    }

    const transformedData = data.items?.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      authorId: item.snippet.channelId,
      published: Math.floor(new Date(item.snippet.publishedAt).getTime() / 1000),
      lengthSeconds: 0,
      viewCount: 0,
      videoThumbnails: [
        { url: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url, quality: 'medium' }
      ]
    })) || []

    console.log('Returning transformed data:', transformedData.length, 'items')

    return new Response(
      JSON.stringify(transformedData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('YouTube channel API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
