
import { useState, useEffect } from "react";
import { Users, Rss } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
}

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
}

const SubscriptionsTab = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [channelInput, setChannelInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load saved channels and API key from localStorage
    const savedChannels = localStorage.getItem('youtube-channels');
    const savedApiKey = localStorage.getItem('youtube-api-key');
    
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    }
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const addChannel = async () => {
    if (!channelInput.trim() || !apiKey.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both API key and channel name/ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Search for channel by name
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          channelInput
        )}&type=channel&maxResults=1&key=${apiKey}`
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to search channel');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.items.length === 0) {
        toast({
          title: "Channel not found",
          description: "No channel found with that name",
          variant: "destructive",
        });
        return;
      }

      const channelData = searchData.items[0];
      const newChannel: Channel = {
        id: channelData.id.channelId,
        title: channelData.snippet.title,
        thumbnail: channelData.snippet.thumbnails.default?.url || '',
      };

      // Check if channel already exists
      if (channels.some(ch => ch.id === newChannel.id)) {
        toast({
          title: "Already subscribed",
          description: "This channel is already in your subscriptions",
        });
        return;
      }

      const updatedChannels = [...channels, newChannel];
      setChannels(updatedChannels);
      localStorage.setItem('youtube-channels', JSON.stringify(updatedChannels));
      localStorage.setItem('youtube-api-key', apiKey);
      
      setChannelInput("");
      toast({
        title: "Channel added",
        description: `Successfully added ${newChannel.title}`,
      });

      // Load videos from this channel
      loadVideos(updatedChannels);
    } catch (error) {
      console.error('Add channel error:', error);
      toast({
        title: "Failed to add channel",
        description: "Please check your API key and try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (channelsToLoad = channels) => {
    if (channelsToLoad.length === 0 || !apiKey) return;

    setLoading(true);
    try {
      const allVideos: Video[] = [];

      // Fetch recent videos from each subscribed channel
      for (const channel of channelsToLoad) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&order=date&maxResults=5&type=video&key=${apiKey}`
        );

        if (response.ok) {
          const data = await response.json();
          const channelVideos: Video[] = data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          }));
          allVideos.push(...channelVideos);
        }
      }

      // Sort videos by publish date (newest first)
      allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      setVideos(allVideos);
    } catch (error) {
      console.error('Load videos error:', error);
      toast({
        title: "Failed to load videos",
        description: "Error loading subscription videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeChannel = (channelId: string) => {
    const updatedChannels = channels.filter(ch => ch.id !== channelId);
    setChannels(updatedChannels);
    localStorage.setItem('youtube-channels', JSON.stringify(updatedChannels));
    
    toast({
      title: "Channel removed",
      description: "Channel removed from subscriptions",
    });

    // Reload videos
    loadVideos(updatedChannels);
  };

  const refreshVideos = () => {
    loadVideos();
  };

  return (
    <div className="p-4 space-y-6">
      {/* API Key Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          YouTube API Key
        </label>
        <Input
          type="password"
          placeholder="Enter your YouTube API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="bg-white/70 backdrop-blur-sm border-gray-200"
        />
      </div>

      {/* Add Channel */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Add Channel
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter channel name..."
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            className="bg-white/70 backdrop-blur-sm border-gray-200"
          />
          <Button 
            onClick={addChannel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Subscribed Channels */}
      {channels.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Subscribed Channels ({channels.length})</h3>
            <Button 
              onClick={refreshVideos}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Rss size={16} className="mr-1" />
              Refresh
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 text-sm"
              >
                {channel.thumbnail && (
                  <img
                    src={channel.thumbnail}
                    alt={channel.title}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="truncate max-w-24">{channel.title}</span>
                <button
                  onClick={() => removeChannel(channel.id)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Latest Videos ({videos.length})
          </h2>
          <div className="grid gap-4">
            {videos.map((video) => (
              <VideoCard key={`${video.channelTitle}-${video.id}`} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {channels.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No subscriptions yet
          </h3>
          <p className="text-gray-500">
            Add channels to see their latest videos here
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTab;
