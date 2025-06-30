
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
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

const SubscriptionsTab = () => {
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
        description: channelData.description || '',
        subscriberCount: channelData.subCount ? channelData.subCount.toLocaleString() : undefined,
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

  const removeChannel = (channelId: string) => {
    const updatedChannels = channels.filter(ch => ch.id !== channelId);
    setChannels(updatedChannels);
    localStorage.setItem('youtube-channels', JSON.stringify(updatedChannels));
    
    toast({
      title: "Channel removed",
      description: "Channel removed from subscriptions",
    });
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
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Subscribed Channels ({channels.length})</h3>
          
          <div className="grid gap-4">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-200"
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
                  <button
                    onClick={() => removeChannel(channel.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
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
            Add channels to see them here
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTab;
