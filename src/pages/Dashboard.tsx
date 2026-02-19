import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Activity, Settings } from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden px-4 py-8">
      <BackgroundGradient />
      
      <div className="w-full max-w-6xl mx-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-briefing-blue transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-briefing-blue border border-briefing-blue/10 shadow-sm">
            Dashboard
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center"
            style={{
              background: 'linear-gradient(to right, #1A1F2C, #4F46E5)',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
          Briefing AI Dashboard
        </h1>

        {/* Dashboard Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">System Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Models Loaded</span>
                <span className="font-medium text-green-600">4 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">API Status</span>
                <span className="font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>

          {/* Models Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LayoutDashboard size={24} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Available Models</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-700">• Qwen 2.5 Coder (14B)</div>
              <div className="text-gray-700">• DeepSeek Coder V2 (16B)</div>
              <div className="text-gray-700">• DeepSeek R1 (14B)</div>
              <div className="text-gray-700">• Qwen 2.5 (14B)</div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings size={24} className="text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Quick Settings</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-briefing-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Manage Preferences
              </button>
              <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                View Logs
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Briefing AI Dashboard • Built with OpenClaw</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
