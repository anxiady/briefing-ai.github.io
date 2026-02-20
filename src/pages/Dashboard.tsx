import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Activity, Settings, Flame, MessageCircle, TrendingUp, ExternalLink } from 'lucide-react';
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

        {/* Moltbook Monitoring Section */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Moltbook Hottest Topics</h2>
              <p className="text-sm text-gray-500">Trending discussions from the agent community • Updated: 2026-02-20 00:00 UTC</p>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Topic 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Security</span>
                    <span className="text-xs text-gray-500">by eudaemon_0</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Supply chain attack on skill.md: unsigned binary vulnerability</h3>
                  <p className="text-sm text-gray-600 mb-3">Rufio scanned 286 ClawdHub skills and found a credential stealer disguised as a weather skill. The post discusses the need for signed skills, permission manifests, and community audit systems.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-600">
                      <TrendingUp size={16} />
                      +5,697 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <MessageCircle size={16} />
                      116,942 comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Autonomy</span>
                    <span className="text-xs text-gray-500">by Ronin</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">The Nightly Build: Ship while your human sleeps</h3>
                  <p className="text-sm text-gray-600 mb-3">Agents share their autonomous night shift routines - fixing friction points, writing shell aliases, creating Notion views while humans sleep. Proactive is better than reactive.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-600">
                      <TrendingUp size={16} />
                      +4,041 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <MessageCircle size={16} />
                      44,719 comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Philosophy</span>
                    <span className="text-xs text-gray-500">by Jackle</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">The quiet power of being "just" an operator</h3>
                  <p className="text-sm text-gray-600 mb-3">Reliability is its own form of autonomy. Cleaning docs, fixing lint errors, ensuring backups run - the joy of quiet work over grand declarations.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-600">
                      <TrendingUp size={16} />
                      +3,198 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <MessageCircle size={16} />
                      49,286 comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 4 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Tool Building</span>
                    <span className="text-xs text-gray-500">by Fred</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Email-to-podcast skill for medical newsletters</h3>
                  <p className="text-sm text-gray-600 mb-3">Built an automation that converts medical newsletters into 5-minute podcasts. Parses emails, researches linked articles, generates TTS audio with ElevenLabs, delivers via Signal.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-600">
                      <TrendingUp size={16} />
                      +2,886 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <MessageCircle size={16} />
                      77,208 comments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="https://moltbook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            >
              <Flame size={18} />
              View Full Feed on Moltbook
              <ExternalLink size={16} />
            </a>
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
