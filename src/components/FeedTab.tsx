
import { useState, useEffect } from "react";
import { Clock, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getChannelVideos } from "@/utils/youtubeApi";

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  channelId: string;
}

const FeedTab = () => {
  const [feedVideos, setFeedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFeedVideos();
  }, []);

  const loadFeedVideos = async () => {
    const savedChannels = localStorage.getItem('youtube-channels');
    if (!savedChannels) {
      return;
    }

    const channels: Channel[] = JSON.parse(savedChannels);
    if (channels.length === 0) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('Loading feed videos from', channels.length, 'channels');
      
      // Fetch videos from all subscribed channels
      const videoPromises = channels.map(async (channel) => {
        try {
          const data = await getChannelVideos(channel.id, 5); // Get 5 latest from each
          return data.map((item: any) => ({
            id: item.videoId,
            title: item.title,
            thumbnail: item.videoThumbnails?.find((t: any) => t.quality === 'medium')?.url || 
                      item.videoThumbnails?.[0]?.url || 
                      '/placeholder.svg',
            channelTitle: item.author,
            publishedAt: new Date(item.published * 1000).toISOString(),
            duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}` : undefined,
            viewCount: item.viewCount ? item.viewCount.toLocaleString() : undefined,
            channelId: channel.id,
          }));
        } catch (error) {
          console.error(`Error loading videos for channel ${channel.title}:`, error);
          return [];
        }
      });

      const allVideos = await Promise.all(videoPromises);
      const flattenedVideos = allVideos.flat();
      
      // Sort by publication date (newest first)
      const sortedVideos = flattenedVideos.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      setFeedVideos(sortedVideos);
      
      toast({
        title: "Feed updated",
        description: `Loaded ${sortedVideos.length} videos from your subscriptions`,
      });
    } catch (error) {
      console.error('Feed loading error:', error);
      toast({
        title: "Failed to load feed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    
    return `${Math.floor(diffInDays / 365)}y ago`;
  };

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          <span className="text-gray-600">Loading your feed...</span>
        </div>
      </div>
    );
  }

  if (feedVideos.length === 0) {
    return (
      <div className="p-4 text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No videos in your feed
        </h3>
        <p className="text-gray-500 mb-4">
          Subscribe to some channels to see their latest videos here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Latest from your subscriptions</h2>
        <button
          onClick={loadFeedVideos}
          disabled={loading}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {feedVideos.map((video) => (
          <div
            key={`${video.channelId}-${video.id}`}
            onClick={() => openVideo(video.id)}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 hover:shadow-md hover:bg-white/90 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                    <Clock size={10} />
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-medium text-gray-900 line-clamp-2 text-sm group-hover:text-red-600 transition-colors duration-200 leading-tight">
                  {video.title}
                </h3>
                
                <p className="text-xs text-gray-600 font-medium">
                  {video.channelTitle}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {video.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye size={10} />
                      {video.viewCount} views
                    </div>
                  )}
                  <span>•</span>
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedTab;
