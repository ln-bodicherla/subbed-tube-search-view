
import { useEffect, useState } from "react";
import { getChannelVideos } from "@/utils/youtubeApi";
import { Play, Eye } from "lucide-react";

const ShortsTab = () => {
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample subscribed channels - in a real app, this would come from user's subscriptions
  const subscribedChannels = [
    { id: 'UCBJycsmduvYEL83R_U4JriQ', name: 'Marques Brownlee' }
  ];

  useEffect(() => {
    const loadShortsVideos = async () => {
      console.log('Loading shorts videos from', subscribedChannels.length, 'channels');
      setLoading(true);
      
      try {
        const allShorts: any[] = [];
        
        for (const channel of subscribedChannels) {
          const channelShorts = await getChannelVideos(channel.id, 10, 'shorts');
          if (channelShorts && Array.isArray(channelShorts)) {
            // Transform the data to match VideoCard expectations
            const transformedShorts = channelShorts.map((video: any) => ({
              id: video.videoId,
              title: video.title,
              thumbnail: video.videoThumbnails?.[0]?.url || '',
              channelTitle: video.author,
              publishedAt: new Date(video.published * 1000).toISOString(), // Convert Unix timestamp to ISO string
              duration: video.lengthSeconds ? `${Math.floor(video.lengthSeconds / 60)}:${(video.lengthSeconds % 60).toString().padStart(2, '0')}` : undefined,
              viewCount: video.viewCount ? video.viewCount.toLocaleString() : undefined
            }));
            allShorts.push(...transformedShorts);
          }
        }
        
        // Sort by publish date (most recent first)
        allShorts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        
        console.log('Transformed shorts videos:', allShorts);
        setShorts(allShorts);
      } catch (error) {
        console.error('Error loading shorts videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadShortsVideos();
  }, []);

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shorts</h2>
        <p className="text-gray-600">Short videos from your subscribed channels</p>
      </div>
      
      {shorts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shorts found</h3>
          <p className="text-gray-500">Short videos from your subscribed channels will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shorts.map((video) => (
            <div 
              key={video.id}
              onClick={() => openVideo(video.id)}
              className="flex items-center gap-4 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:shadow-md hover:bg-white/80 transition-all duration-200 cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded-md"
                  loading="lazy"
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center rounded-md">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Play className="text-white ml-0.5" size={14} fill="currentColor" />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors duration-200 text-sm leading-tight mb-1">
                  {video.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium truncate">
                    {video.channelTitle}
                  </span>
                  <span className="ml-2 whitespace-nowrap">
                    {formatDate(video.publishedAt)}
                  </span>
                </div>

                {video.viewCount && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Eye size={10} />
                    {video.viewCount} views
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShortsTab;
