
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
      {/* Animated Header/Logo Section */}
      <div className={`transition-all duration-500 ease-in-out ${
        activeTab === 'search' 
          ? 'min-h-[60vh] flex items-center justify-center' 
          : 'h-20 flex items-center justify-center bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50'
      }`}>
        <div className="text-center">
          {/* Logo */}
          <div className={`transition-all duration-500 ease-in-out mb-6 ${
            activeTab === 'search' ? 'transform scale-150' : 'transform scale-100 mb-0'
          }`}>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              WFYT
            </h1>
          </div>
          
          {/* Search Bar - only visible on search tab */}
          {activeTab === 'search' && (
            <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search YouTube videos..."
                  className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-300 focus:border-red-500 focus:outline-none shadow-lg bg-white"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full">
                  <Search className="text-gray-600" size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className={`${activeTab === 'search' ? '' : 'pt-0'} pb-20`}>
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
