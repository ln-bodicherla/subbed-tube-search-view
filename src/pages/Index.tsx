
import { useState } from "react";
import { Search, Users, Rss, Play } from "lucide-react";
import SearchTab from "@/components/SearchTab";
import SubscriptionsTab from "@/components/SubscriptionsTab";
import FeedTab from "@/components/FeedTab";
import ShortsTab from "@/components/ShortsTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'subscriptions' | 'feed' | 'shorts'>('search');

  console.log('Index page rendering, active tab:', activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YT</span>
            </div>
            Clean YouTube
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'feed' && <FeedTab />}
        {activeTab === 'shorts' && <ShortsTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-red-50 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search size={20} />
            <span className="text-xs font-medium">Search</span>
          </button>
          
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
              activeTab === 'feed'
                ? 'bg-red-50 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Rss size={20} />
            <span className="text-xs font-medium">Feed</span>
          </button>
          
          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
              activeTab === 'shorts'
                ? 'bg-red-50 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Play size={20} />
            <span className="text-xs font-medium">Shorts</span>
          </button>
          
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
              activeTab === 'subscriptions'
                ? 'bg-red-50 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={20} />
            <span className="text-xs font-medium">Subscriptions</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
