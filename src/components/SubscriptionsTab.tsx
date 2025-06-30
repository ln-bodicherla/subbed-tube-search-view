
import { useState, useEffect } from "react";
import { Users, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ChannelSearch from "@/components/ChannelSearch";
import VideoCard from "@/components/VideoCard";
import { getChannelVideos } from "@/utils/youtubeApi";

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  description?: string;
  subscriberCount?: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
}

const SubscriptionsTab = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedChannels = localStorage.getItem('youtube-channels');
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    }
  }, []);

  const addChannel = (newChannel: Channel) => {
    const updatedChannels = [...channels, newChannel];
    setChannels(updatedChannels);
    localStorage.setItem('youtube-channels', JSON.stringify(updatedChannels));
    
    toast({
      title: "Channel added",
      description: `Successfully added ${newChannel.title}`,
    });
  };

  const removeChannel = (channelId: string) => {
    const updatedChannels = channels.filter(ch => ch.id !== channelId);
    setChannels(updatedChannels);
    localStorage.setItem('youtube-channels', JSON.stringify(updatedChannels));
    
    // Clear videos if removing the selected channel
    if (selectedChannelId === channelId) {
      setSelectedChannelId(null);
      setChannelVideos([]);
    }
    
    toast({
      title: "Channel removed",
      description: "Channel removed from subscriptions",
    });
  };

  const loadChannelVideos = async (channelId: string, channelTitle: string) => {
    if (selectedChannelId === channelId) {
      // If clicking the same channel, hide videos
      setSelectedChannelId(null);
      setChannelVideos([]);
      return;
    }

    setLoadingVideos(true);
    setSelectedChannelId(channelId);
    
    try {
      console.log('Loading videos for channel:', channelId);
      
      const data = await getChannelVideos(channelId, 20);
      
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

      setChannelVideos(formattedVideos);
      
      toast({
        title: "Videos loaded",
        description: `Found ${formattedVideos.length} videos from ${channelTitle}`,
      });
    } catch (error) {
      console.error('Load channel videos error:', error);
      toast({
        title: "Failed to load videos",
        description: "Please check your API configuration",
        variant: "destructive",
      });
      setChannelVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Channel Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Search & Add Channels
        </label>
        <ChannelSearch 
          onChannelAdd={addChannel}
          existingChannelIds={channels.map(ch => ch.id)}
        />
      </div>

      {/* Subscribed Channels */}
      {channels.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Subscribed Channels ({channels.length})</h3>
          
          <div className="grid gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-200 ${
                  selectedChannelId === channel.id ? 'ring-2 ring-red-200 bg-red-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {channel.thumbnail && (
                    <img
                      src={channel.thumbnail}
                      alt={channel.title}
                      className="w-16 h-16 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{channel.title}</h4>
                    {channel.subscriberCount && (
                      <p className="text-sm text-gray-600 mt-1">
                        {channel.subscriberCount} subscribers
                      </p>
                    )}
                    {channel.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {channel.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => loadChannelVideos(channel.id, channel.title)}
                      disabled={loadingVideos}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >
                      {loadingVideos && selectedChannelId === channel.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Play size={16} />
                      )}
                      {selectedChannelId === channel.id ? 'Hide' : 'Videos'}
                    </Button>
                    <button
                      onClick={() => removeChannel(channel.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Channel Videos */}
      {selectedChannelId && channelVideos.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">
            Latest Videos ({channelVideos.length})
          </h3>
          <div className="grid gap-4">
            {channelVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
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
            Search and add channels to see them here
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTab;
