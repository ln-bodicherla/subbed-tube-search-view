import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";
import VideoPlayer from "@/components/VideoPlayer";
import { useToast } from "@/hooks/use-toast";
import { searchYouTubeVideos } from "@/utils/youtubeApi";
import { Play, Clock, Eye } from "lucide-react";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
}

const SearchTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { toast } = useToast();

  const searchVideos = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting YouTube API search for videos:', searchQuery);
      
      const data = await searchYouTubeVideos(searchQuery);
      
      const formattedVideos: Video[] = data.map((item: any) => ({
        id: item.videoId,
        title: item.title,
        thumbnail: item.videoThumbnails?.find((t: any) => t.quality === 'medium')?.url || 
                  item.videoThumbnails?.[0]?.url || 
                  '/placeholder.svg',
        channelTitle: item.author,
        publishedAt: new Date(item.published * 1000).toISOString(),
        duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}` : undefined,
        viewCount: item.viewCount ? item.viewCount.toLocaleString() : undefined,
      }));

      setVideos(formattedVideos);
      setHasSearched(true);
      
      toast({
        title: "Search completed",
        description: `Found ${formattedVideos.length} videos`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please check your API configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchVideos();
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

  const openVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  // After search results - show compact header with search bar
  if (hasSearched && videos.length > 0) {
    return (
      <div className="min-h-screen">
        {/* Video Player Modal */}
        {selectedVideo && (
          <VideoPlayer
            videoId={selectedVideo.id}
            title={selectedVideo.title}
            onClose={closeVideo}
          />
        )}

        {/* Compact Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 px-4 py-3">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">SubStream</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search YouTube videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 py-2 rounded-full border border-gray-300 focus:border-red-500 bg-white"
                  />
                </div>
                <Button 
                  onClick={searchVideos}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results in Feed Style */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Search Results</h2>
            <p className="text-gray-600">{videos.length} videos found for "{searchQuery}"</p>
          </div>
          
          <div className="space-y-3">
            {videos.map((video) => (
              <div 
                key={video.id}
                onClick={() => openVideo(video)}
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
        </div>
      </div>
    );
  }

  // Initial search state - centered logo and search
  return (
    <div className="space-y-6 px-4">
      {/* Search Input - positioned directly below the logo with no gap */}
      <div className="flex justify-center -mt-8 mb-4">
        <div className="w-full max-w-2xl">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search YouTube videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 py-4 text-lg rounded-full border-2 border-gray-300 focus:border-red-500 bg-white shadow-lg"
              />
            </div>
            <Button 
              onClick={searchVideos}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={20} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasSearched && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Search for videos
          </h3>
          <p className="text-gray-500">
            Enter a search term to find videos on YouTube
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchTab;
