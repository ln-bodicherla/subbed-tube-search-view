
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('YouTube channel details function called with method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { channelId } = await req.json()
    console.log('Channel details parameters:', { channelId })
    
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      console.error('YouTube API key not found in environment')
      throw new Error('YouTube API key not configured')
    }

    console.log('Making request to YouTube API for channel details...')
    // Get channel details including subscriber count
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
    
    const response = await fetch(channelUrl)
    const data = await response.json()

    console.log('YouTube API response status:', response.status)

    if (!response.ok) {
      console.error('YouTube API error:', data)
      throw new Error(data.error?.message || 'YouTube API request failed')
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Channel not found')
    }

    const channel = data.items[0]
    const transformedData = {
      channelId: channel.id,
      channelTitle: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
      subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
      videoCount: parseInt(channel.statistics?.videoCount || '0'),
      viewCount: parseInt(channel.statistics?.viewCount || '0'),
    }

    console.log('Returning channel details:', transformedData)

    return new Response(
      JSON.stringify(transformedData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('YouTube channel details API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
