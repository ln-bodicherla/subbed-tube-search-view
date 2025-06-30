
import { useEffect, useState } from "react";
import { getChannelVideos } from "@/utils/youtubeApi";
import VideoCard from "./VideoCard";

const FeedTab = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample subscribed channels - in a real app, this would come from user's subscriptions
  const subscribedChannels = [
    { id: 'UCBJycsmduvYEL83R_U4JriQ', name: 'Marques Brownlee' }
  ];

  useEffect(() => {
    const loadFeedVideos = async () => {
      console.log('Loading feed videos from', subscribedChannels.length, 'channels');
      setLoading(true);
      
      try {
        const allVideos: any[] = [];
        
        for (const channel of subscribedChannels) {
          const channelVideos = await getChannelVideos(channel.id, 5, 'regular');
          if (channelVideos && Array.isArray(channelVideos)) {
            // Transform the data to match VideoCard expectations
            const transformedVideos = channelVideos.map((video: any) => ({
              id: video.videoId,
              title: video.title,
              thumbnail: video.videoThumbnails?.[0]?.url || '',
              channelTitle: video.author,
              publishedAt: new Date(video.published * 1000).toISOString(), // Convert Unix timestamp to ISO string
              duration: video.lengthSeconds ? `${Math.floor(video.lengthSeconds / 60)}:${(video.lengthSeconds % 60).toString().padStart(2, '0')}` : undefined,
              viewCount: video.viewCount ? video.viewCount.toLocaleString() : undefined
            }));
            allVideos.push(...transformedVideos);
          }
        }
        
        // Sort by publish date (most recent first)
        allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        
        console.log('Transformed feed videos:', allVideos);
        setVideos(allVideos);
      } catch (error) {
        console.error('Error loading feed videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Feed</h2>
        <p className="text-gray-600">Latest videos from your subscribed channels</p>
      </div>
      
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-500">Videos from your subscribed channels will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedTab;
