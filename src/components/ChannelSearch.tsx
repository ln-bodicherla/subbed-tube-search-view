
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { searchYouTubeChannels } from "@/utils/youtubeApi";

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  description?: string;
  subscriberCount?: string;
}

interface ChannelSearchProps {
  onChannelAdd: (channel: Channel) => void;
  existingChannelIds: string[];
}

const ChannelSearch = ({ onChannelAdd, existingChannelIds }: ChannelSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchChannels = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a channel name to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for channels:', searchQuery);
      
      const data = await searchYouTubeChannels(searchQuery);
      
      if (data.length === 0) {
        toast({
          title: "No channels found",
          description: "Try a different search term",
        });
        setSearchResults([]);
        return;
      }

      const formattedChannels: Channel[] = data.map((item: any) => ({
        id: item.channelId || item.authorId,
        title: item.channelTitle || item.author,
        thumbnail: item.thumbnail || item.videoThumbnails?.[0]?.url || '/placeholder.svg',
        subscriberCount: item.subscriberCount ? formatSubscriberCount(item.subscriberCount) : undefined,
      }));

      setSearchResults(formattedChannels);
      
      toast({
        title: "Search completed",
        description: `Found ${formattedChannels.length} channels`,
      });
    } catch (error) {
      console.error('Channel search error:', error);
      toast({
        title: "Search failed",
        description: "Please check your API configuration",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatSubscriberCount = (count: number | string): string => {
    const num = typeof count === 'string' ? parseInt(count) : count;
    if (isNaN(num) || num === 0) return 'No subscriber info';
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchChannels();
    }
  };

  const addChannel = (channel: Channel) => {
    if (existingChannelIds.includes(channel.id)) {
      toast({
        title: "Already subscribed",
        description: "This channel is already in your subscriptions",
      });
      return;
    }

    onChannelAdd(channel);
    setSearchResults(prev => prev.filter(c => c.id !== channel.id));
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search for channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 bg-white/70 backdrop-blur-sm border-gray-200"
          />
        </div>
        <Button 
          onClick={searchChannels}
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

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Search Results</h4>
          <div className="grid gap-3 max-h-80 overflow-y-auto">
            {searchResults.map((channel) => (
              <div
                key={channel.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={channel.thumbnail}
                    alt={channel.title}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate">{channel.title}</h5>
                    <p className="text-sm text-gray-600">
                      {channel.subscriberCount ? `${channel.subscriberCount} subscribers` : 'Subscriber count not available'}
                    </p>
                  </div>
                  <Button
                    onClick={() => addChannel(channel)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelSearch;
