
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('YouTube search function called with method:', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchQuery, type = 'video', maxResults = 25 } = await req.json()
    console.log('Search parameters:', { searchQuery, type, maxResults })
    
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      console.error('YouTube API key not found in environment')
      throw new Error('YouTube API key not configured')
    }

    console.log('Making request to YouTube API...')
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=${type}&maxResults=${maxResults}&key=${apiKey}`
    
    const response = await fetch(searchUrl)
    const data = await response.json()

    console.log('YouTube API response status:', response.status)
    
    if (!response.ok) {
      console.error('YouTube API error:', data)
      throw new Error(data.error?.message || 'YouTube API request failed')
    }

    let transformedData = []

    if (type === 'channel' && data.items) {
      // For channels, get additional details including subscriber count
      const channelIds = data.items.map((item: any) => item.id.channelId).filter(Boolean)
      
      if (channelIds.length > 0) {
        console.log('Fetching channel details for subscriber counts...')
        const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds.join(',')}&key=${apiKey}`
        
        const channelResponse = await fetch(channelDetailsUrl)
        const channelData = await channelResponse.json()
        
        if (channelResponse.ok && channelData.items) {
          transformedData = channelData.items.map((channel: any) => ({
            channelId: channel.id,
            channelTitle: channel.snippet.title,
            description: channel.snippet.description,
            thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
            subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
            videoCount: parseInt(channel.statistics?.videoCount || '0'),
            viewCount: parseInt(channel.statistics?.viewCount || '0'),
          }))
        }
      }
    } else {
      // For videos, use the original transformation
      transformedData = data.items?.map((item: any) => ({
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
    }

    console.log('Returning transformed data:', transformedData.length, 'items')
    
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
