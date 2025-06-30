import { useState, useEffect } from "react";
import { Users, Rss } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/VideoCard";
import { useToast } from "@/hooks/use-toast";
import { searchYouTubeChannels, getChannelVideos } from "@/utils/youtubeApi";

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
  const [channelInput, setChannelInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedChannels = localStorage.getItem('youtube-channels');
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    }
  }, []);

  const addChannel = async () => {
    if (!channelInput.trim()) {
      toast({
        title: "Channel name required",
        description: "Please enter a channel name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for channel:', channelInput);
      
      const data = await searchYouTubeChannels(channelInput);
      
      if (data.length === 0) {
        toast({
          title: "No channels found",
          description: "Try a different search term",
        });
        return;
      }

      const channelData = data[0];
      const newChannel: Channel = {
        id: channelData.authorId,
        title: channelData.author,
        thumbnail: channelData.videoThumbnails?.[0]?.url || '/placeholder.svg',
      };

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
      
      setChannelInput("");
      toast({
        title: "Channel added",
        description: `Successfully added ${newChannel.title}`,
      });

      loadVideos(updatedChannels);
    } catch (error) {
      console.error('Add channel error:', error);
      toast({
        title: "Failed to add channel",
        description: "Please check your API configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (channelsToLoad = channels) => {
    if (channelsToLoad.length === 0) return;

    setLoading(true);
    try {
      const allVideos: Video[] = [];

      for (const channel of channelsToLoad) {
        try {
          const channelVideos = await getChannelVideos(channel.id);
          
          const formattedVideos: Video[] = channelVideos.map((item: any) => ({
            id: item.videoId,
            title: item.title,
            thumbnail: item.videoThumbnails?.[0]?.url || '/placeholder.svg',
            channelTitle: item.author,
            publishedAt: new Date(item.published * 1000).toISOString(),
            duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}` : undefined,
            viewCount: item.viewCount ? item.viewCount.toLocaleString() : undefined,
          }));
          
          allVideos.push(...formattedVideos);
        } catch (error) {
          console.error(`Failed to load videos for ${channel.title}:`, error);
        }
      }

      allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      setVideos(allVideos);
      
      toast({
        title: "Videos loaded",
        description: `Loaded ${allVideos.length} videos from subscriptions`,
      });
    } catch (error) {
      console.error('Load videos error:', error);
      toast({
        title: "Failed to load videos",
        description: "Please check your API configuration",
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

    loadVideos(updatedChannels);
  };

  const refreshVideos = () => {
    loadVideos();
  };

  return (
    <div className="p-4 space-y-6">
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
