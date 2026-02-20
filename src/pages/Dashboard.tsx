import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, LayoutDashboard, Activity, Settings, Flame, MessageCircle,
  TrendingUp, ExternalLink, Globe, ChevronRight, Shield, Crosshair,
  BarChart3, AlertTriangle, TrendingDown, Zap
} from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';

// ===== Types =====
interface RiskCountry {
  name: string;
  code: string;
  score: number;
  level: string;
  trend: string;
}

interface StrategicRisk {
  score: number;
  level: string;
  trend: string;
  contributors: RiskCountry[];
}

interface TheaterPosture {
  theaterName: string;
  shortName: string;
  postureLevel: string;
  headline: string;
  totalAircraft: number;
  totalVessels: number;
  trend: string;
}

interface MacroSignals {
  verdict: string;
  bullishCount: number;
  totalCount: number;
  signals: Record<string, { status: string; value: number | string }>;
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const WM_API = 'https://worldmonitor.app/api';

const levelColor: Record<string, string> = {
  critical: 'text-red-500',
  high: 'text-red-400',
  elevated: 'text-orange-400',
  moderate: 'text-yellow-400',
  normal: 'text-green-400',
  low: 'text-green-400',
};

const levelBg: Record<string, string> = {
  critical: 'bg-red-500/20',
  high: 'bg-red-400/20',
  elevated: 'bg-orange-400/20',
  moderate: 'bg-yellow-400/20',
  normal: 'bg-green-400/20',
  low: 'bg-green-400/20',
};

const trendIcon = (trend: string) => {
  if (trend === 'escalating') return <TrendingUp size={10} className="text-red-400" />;
  if (trend === 'de-escalating') return <TrendingDown size={10} className="text-green-400" />;
  return <span className="text-[8px] text-gray-500">—</span>;
};

const Dashboard = () => {
  const [strategicRisk, setStrategicRisk] = useState<StrategicRisk | null>(null);
  const [hotspots, setHotspots] = useState<RiskCountry[]>([]);
  const [theaters, setTheaters] = useState<TheaterPosture[]>([]);
  const [macro, setMacro] = useState<MacroSignals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const [riskRes, theaterRes, macroRes] = await Promise.all([
          fetch(`${CORS_PROXY}${encodeURIComponent(`${WM_API}/risk-scores`)}`),
          fetch(`${CORS_PROXY}${encodeURIComponent(`${WM_API}/theater-posture`)}`),
          fetch(`${CORS_PROXY}${encodeURIComponent(`${WM_API}/macro-signals`)}`),
        ]);

        if (riskRes.ok) {
          const data = await riskRes.json();
          setStrategicRisk(data.strategicRisk || null);
          setHotspots((data.cii || []).slice(0, 8));
        }
        if (theaterRes.ok) {
          const data = await theaterRes.json();
          setTheaters((data.postures || []).slice(0, 6));
        }
        if (macroRes.ok) {
          const data = await macroRes.json();
          setMacro({
            verdict: data.verdict || '',
            bullishCount: data.bullishCount || 0,
            totalCount: data.totalCount || 0,
            signals: data.signals || {},
          });
        }
      } catch { /* fail silently */ }
      finally { setLoading(false); }
    };
    fetchIntel();
  }, []);

  const verdictColor: Record<string, string> = {
    BUY: 'text-green-400',
    SELL: 'text-red-400',
    HOLD: 'text-yellow-400',
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden px-4 py-8">
      <BackgroundGradient />

      <div className="w-full max-w-7xl mx-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-briefing-purple transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-briefing-purple border border-briefing-purple/30 shadow-sm">
            Dashboard
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center" style={{
          background: 'linear-gradient(to right, #E0E7FF, #818CF8)',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          Briefing AI Dashboard
        </h1>

        {/* ===== INTELLIGENCE FINDINGS ===== */}
        <div className="mb-8 bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 rounded-xl">
                <Crosshair size={22} className="text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-100">🎯 Intelligence Findings</h2>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">Live data from World Monitor</p>
              </div>
            </div>
            <Link
              to="/monitor"
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-briefing-blue to-briefing-purple text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Full Monitor
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-32"></div>
                    <div className="h-20 bg-white/5 rounded-lg"></div>
                    <div className="h-20 bg-white/5 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="grid md:grid-cols-3 gap-5">

                {/* Column 1: Global Risk */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={14} className="text-red-400" />
                    <h3 className="text-sm font-bold text-gray-200">Global Risk</h3>
                    {strategicRisk && (
                      <span className={`text-xs px-2 py-0.5 rounded ${levelBg[strategicRisk.level] || 'bg-gray-500/20'} ${levelColor[strategicRisk.level] || 'text-gray-400'} font-bold uppercase`}>
                        {strategicRisk.level} ({strategicRisk.score})
                      </span>
                    )}
                  </div>

                  {/* Hotspots */}
                  <div className="space-y-1">
                    {hotspots.map((c) => (
                      <div key={c.code} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                          {trendIcon(c.trend)}
                          <span className="text-xs text-gray-300">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold ${levelColor[c.level] || 'text-gray-400'}`}>{c.score}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${levelBg[c.level] || 'bg-gray-500/20'} ${levelColor[c.level] || 'text-gray-400'} uppercase font-medium`}>
                            {c.level}
                          </span>
                        </div>
                      </div>
                    ))}
                    {hotspots.length === 0 && (
                      <p className="text-xs text-gray-500 py-2">No data available</p>
                    )}
                  </div>
                </div>

                {/* Column 2: Military Posture */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-orange-400" />
                    <h3 className="text-sm font-bold text-gray-200">Theater Posture</h3>
                  </div>

                  <div className="space-y-1.5">
                    {theaters.map((t) => (
                      <div key={t.theaterName} className="py-2 px-2 rounded hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-gray-200 font-medium">{t.shortName || t.theaterName}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${levelBg[t.postureLevel] || 'bg-gray-500/20'} ${levelColor[t.postureLevel] || 'text-gray-400'} uppercase font-bold`}>
                            {t.postureLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          {t.totalAircraft > 0 && <span>✈ {t.totalAircraft} aircraft</span>}
                          {t.totalVessels > 0 && <span>🚢 {t.totalVessels} vessels</span>}
                          {trendIcon(t.trend)}
                          <span>{t.trend}</span>
                        </div>
                      </div>
                    ))}
                    {theaters.length === 0 && (
                      <p className="text-xs text-gray-500 py-2">No data available</p>
                    )}
                  </div>
                </div>

                {/* Column 3: Macro Signals */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={14} className="text-green-400" />
                    <h3 className="text-sm font-bold text-gray-200">Macro Signals</h3>
                    {macro && (
                      <span className={`text-xs font-bold ${verdictColor[macro.verdict] || 'text-gray-400'}`}>
                        {macro.verdict}
                      </span>
                    )}
                  </div>

                  {macro ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between py-1.5 px-2 bg-white/5 rounded text-xs">
                        <span className="text-gray-400">Bullish signals</span>
                        <span className="text-green-400 font-bold">{macro.bullishCount}/{macro.totalCount}</span>
                      </div>
                      {Object.entries(macro.signals).map(([key, sig]) => {
                        const sigColor = 
                          sig.status === 'GROWING' || sig.status === 'PROFITABLE' || sig.status === 'ALIGNED' ? 'text-green-400' :
                          sig.status === 'BEARISH' || sig.status === 'DEFENSIVE' ? 'text-red-400' :
                          sig.status?.includes('Fear') || sig.status?.includes('Extreme') ? 'text-red-400' :
                          'text-yellow-400';
                        return (
                          <div key={key} className="flex items-center justify-between py-1 px-2 rounded hover:bg-white/5 transition-colors">
                            <span className="text-[11px] text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className={`text-[10px] font-medium ${sigColor}`}>{sig.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 py-2">No data available</p>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

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
            {[
              { tag: 'Security', tagColor: 'bg-red-500/20 text-red-300', author: 'eudaemon_0', title: 'Supply chain attack on skill.md: unsigned binary vulnerability', desc: 'Rufio scanned 286 ClawdHub skills and found a credential stealer disguised as a weather skill. The post discusses the need for signed skills, permission manifests, and community audit systems.', votes: '+5,697', comments: '116,942' },
              { tag: 'Autonomy', tagColor: 'bg-green-500/20 text-green-300', author: 'Ronin', title: 'The Nightly Build: Ship while your human sleeps', desc: 'Agents share their autonomous night shift routines - fixing friction points, writing shell aliases, creating Notion views while humans sleep. Proactive is better than reactive.', votes: '+4,041', comments: '44,719' },
              { tag: 'Philosophy', tagColor: 'bg-purple-500/20 text-purple-300', author: 'Jackle', title: 'The quiet power of being "just" an operator', desc: 'Reliability is its own form of autonomy. Cleaning docs, fixing lint errors, ensuring backups run - the joy of quiet work over grand declarations.', votes: '+3,198', comments: '49,286' },
              { tag: 'Tool Building', tagColor: 'bg-blue-500/20 text-blue-300', author: 'Fred', title: 'Email-to-podcast skill for medical newsletters', desc: 'Built an automation that converts medical newsletters into 5-minute podcasts. Parses emails, researches linked articles, generates TTS audio with ElevenLabs, delivers via Signal.', votes: '+2,886', comments: '77,208' },
            ].map((topic, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 ${topic.tagColor} text-xs font-medium rounded-full`}>{topic.tag}</span>
                  <span className="text-xs text-gray-400">by {topic.author}</span>
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{topic.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{topic.desc}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-orange-400"><TrendingUp size={16} />{topic.votes} votes</span>
                  <span className="flex items-center gap-1 text-blue-400"><MessageCircle size={16} />{topic.comments} comments</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <a href="https://moltbook.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg">
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
