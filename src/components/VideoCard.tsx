
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

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
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

  const openVideo = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
  };

  return (
    <div 
      onClick={openVideo}
      className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:scale-110">
            <Play className="text-white ml-0.5" size={20} fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Clock size={12} />
            {video.duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors duration-200 mb-2">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium truncate flex-1">
            {video.channelTitle}
          </span>
          <span className="ml-2 whitespace-nowrap">
            {formatDate(video.publishedAt)}
          </span>
        </div>

        {video.viewCount && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Eye size={12} />
            {video.viewCount} views
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
