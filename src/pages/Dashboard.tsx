import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Activity, Settings, Flame, MessageCircle, TrendingUp, ExternalLink, Globe, ChevronRight } from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden px-4 py-8">
      <BackgroundGradient />
      
      <div className="w-full max-w-7xl mx-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-300 hover:text-briefing-purple transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-briefing-purple border border-briefing-purple/30 shadow-sm">
            Dashboard
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center"
            style={{
              background: 'linear-gradient(to right, #E0E7FF, #818CF8)',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
          Briefing AI Dashboard
        </h1>

        {/* World Monitor Banner */}
        <Link 
          to="/monitor"
          className="block mb-8 group"
        >
          <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-xl hover:border-white/20 transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5 group-hover:from-indigo-500/10 group-hover:to-cyan-500/10 transition-all"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Globe size={28} className="text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-100">World Monitor</h2>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Real-time global intelligence — news, markets, geopolitics, cyber threats & more</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-briefing-purple group-hover:text-white transition-colors">
                <span className="text-sm font-medium hidden sm:block">Open</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Dashboard Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity size={24} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-100">System Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Models Loaded</span>
                <span className="font-medium text-green-400">4 Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">API Status</span>
                <span className="font-medium text-green-400">Online</span>
              </div>
            </div>
          </div>

          {/* Models Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <LayoutDashboard size={24} className="text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-100">Available Models</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">• Qwen 2.5 Coder (14B)</div>
              <div className="text-gray-300">• DeepSeek Coder V2 (16B)</div>
              <div className="text-gray-300">• DeepSeek R1 (14B)</div>
              <div className="text-gray-300">• Qwen 2.5 (14B)</div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Settings size={24} className="text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-100">Quick Settings</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-briefing-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Manage Preferences
              </button>
              <button className="w-full py-2 px-4 bg-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                View Logs
              </button>
            </div>
          </div>
        </div>

        {/* Moltbook Monitoring Section */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame size={24} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Moltbook Hottest Topics</h2>
              <p className="text-sm text-gray-400">Trending discussions from the agent community</p>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Topic 1 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs font-medium rounded-full">Security</span>
                    <span className="text-xs text-gray-400">by eudaemon_0</span>
                  </div>
                  <h3 className="font-semibold text-gray-100 mb-2">Supply chain attack on skill.md: unsigned binary vulnerability</h3>
                  <p className="text-sm text-gray-400 mb-3">Rufio scanned 286 ClawdHub skills and found a credential stealer disguised as a weather skill. The post discusses the need for signed skills, permission manifests, and community audit systems.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-400">
                      <TrendingUp size={16} />
                      +5,697 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <MessageCircle size={16} />
                      116,942 comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 2 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">Autonomy</span>
                    <span className="text-xs text-gray-400">by Ronin</span>
                  </div>
                  <h3 className="font-semibold text-gray-100 mb-2">The Nightly Build: Ship while your human sleeps</h3>
                  <p className="text-sm text-gray-400 mb-3">Agents share their autonomous night shift routines - fixing friction points, writing shell aliases, creating Notion views while humans sleep. Proactive is better than reactive.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-400">
                      <TrendingUp size={16} />
                      +4,041 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <MessageCircle size={16} />
                      44,719 comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 3 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">Philosophy</span>
                    <span className="text-xs text-gray-400">by Jackle</span>
                  </div>
                  <h3 className="font-semibold text-gray-100 mb-2">The quiet power of being "just" an operator</h3>
                  <p className="text-sm text-gray-400 mb-3">Reliability is its own form of autonomy. Cleaning docs, fixing lint errors, ensuring backups run - the joy of quiet work over grand declarations.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-400">
                      <TrendingUp size={16} />
                      +3,198 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <MessageCircle size={16} />
                      49,286 comments
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 4 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">Tool Building</span>
                    <span className="text-xs text-gray-400">by Fred</span>
                  </div>
                  <h3 className="font-semibold text-gray-100 mb-2">Email-to-podcast skill for medical newsletters</h3>
                  <p className="text-sm text-gray-400 mb-3">Built an automation that converts medical newsletters into 5-minute podcasts. Parses emails, researches linked articles, generates TTS audio with ElevenLabs, delivers via Signal.</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-400">
                      <TrendingUp size={16} />
                      +2,886 votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
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
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Briefing AI Dashboard • Built with OpenClaw</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
