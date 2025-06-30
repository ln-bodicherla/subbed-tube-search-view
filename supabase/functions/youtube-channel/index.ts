
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
    const { channelId, maxResults = 10, videoType = 'all' } = await req.json()
    console.log('Channel parameters:', { channelId, maxResults, videoType })
    
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      console.error('YouTube API key not found in environment')
      throw new Error('YouTube API key not configured')
    }

    console.log('Making request to YouTube API for channel videos...')
    
    // Build the search URL based on video type
    let videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`
    
    // Add duration filter for shorts only (regular videos don't need duration filter)
    if (videoType === 'shorts') {
      videosUrl += '&videoDuration=short' // Videos under 4 minutes
    }
    
    const response = await fetch(videosUrl)
    const data = await response.json()

    console.log('YouTube API response status:', response.status)

    if (!response.ok) {
      console.error('YouTube API error:', data)
      throw new Error(data.error?.message || 'YouTube API request failed')
    }

    // Get all videos first
    let filteredItems = data.items || []
    
    // For regular videos or more precise filtering, get video details to check actual duration
    if (videoType === 'shorts' || videoType === 'regular') {
      const videoIds = filteredItems.map((item: any) => item.id.videoId).join(',')
      if (videoIds) {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()
        
        if (detailsResponse.ok && detailsData.items) {
          // Create a map of video durations
          const durationMap = new Map()
          detailsData.items.forEach((video: any) => {
            const duration = video.contentDetails.duration
            // Parse ISO 8601 duration (PT1M30S format)
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
            const hours = parseInt(match?.[1] || '0')
            const minutes = parseInt(match?.[2] || '0')
            const seconds = parseInt(match?.[3] || '0')
            const totalSeconds = hours * 3600 + minutes * 60 + seconds
            durationMap.set(video.id, totalSeconds)
          })
          
          // Filter based on duration (shorts are typically under 60 seconds)
          filteredItems = filteredItems.filter((item: any) => {
            const duration = durationMap.get(item.id.videoId) || 0
            if (videoType === 'shorts') {
              return duration <= 60 // Shorts are 60 seconds or less
            } else if (videoType === 'regular') {
              return duration > 60 // Regular videos are over 60 seconds
            }
            return true
          })
        }
      }
    }

    const transformedData = filteredItems.map((item: any) => ({
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
    }))

    console.log(`Returning ${videoType} videos data:`, transformedData.length, 'items')

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
