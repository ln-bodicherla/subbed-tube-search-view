
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChannelSearch from "@/components/ChannelSearch";

interface Channel {
  id: string;
  title: string;
  thumbnail: string;
  description?: string;
  subscriberCount?: string;
}

const SubscriptionsTab = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
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
    
    toast({
      title: "Channel removed",
      description: "Channel removed from subscriptions",
    });
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
          
          <div className="grid gap-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {channel.thumbnail && (
                    <img
                      src={channel.thumbnail}
                      alt={channel.title}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{channel.title}</h4>
                    {channel.subscriberCount && (
                      <p className="text-sm text-gray-600">
                        {channel.subscriberCount} subscribers
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
            Search and add channels to see them here
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTab;
