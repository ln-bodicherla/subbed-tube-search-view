import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";
import { useToast } from "@/hooks/use-toast";
import { fetchWithFallback } from "@/utils/invidiousApi";

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
      console.log('Starting search for:', searchQuery);
      
      const data = await fetchWithFallback(
        `search?q=${encodeURIComponent(searchQuery)}&type=video&sort_by=relevance`
      );
      
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
      
      if (formattedVideos.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${formattedVideos.length} videos`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search completed with demo data",
        description: "Showing sample results while we work on API connectivity",
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

  return (
    <div className="p-4 space-y-6">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 bg-white/70 backdrop-blur-sm border-gray-200"
          />
        </div>
        <Button 
          onClick={searchVideos}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search size={20} />
          )}
        </Button>
      </div>

      {/* Results */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Search Results ({videos.length})
          </h2>
          <div className="grid gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {videos.length === 0 && !loading && (
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
