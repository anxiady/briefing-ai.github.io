import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, LayoutDashboard, Activity, Settings, Flame, MessageCircle,
  TrendingUp, ExternalLink, Globe, ChevronRight, Shield, Crosshair,
  BarChart3, Zap, TrendingDown
} from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';

// ===== Keyword Spike Detection =====

interface GdeltArticle {
  title: string;
  url: string;
  domain: string;
  seendate: string;
}

interface KeywordSpike {
  term: string;
  displayTerm: string;
  count: number;
  uniqueSources: number;
  baselineEstimate: number;
  multiplier: number;
  confidence: number;
  headlines: { title: string; source: string; link: string }[];
  detectedAt: Date;
}

// Tracked terms — leaders + geopolitical keywords. Baselines are rough daily-averages.
const TRACKED_TERMS: { term: string; display: string; baseline: number }[] = [
  { term: 'trump', display: 'Trump', baseline: 2 },
  { term: 'biden', display: 'Biden', baseline: 1.5 },
  { term: 'putin', display: 'Putin', baseline: 1.5 },
  { term: 'zelensky', display: 'Zelensky', baseline: 1 },
  { term: 'xi jinping', display: 'Xi Jinping', baseline: 0.8 },
  { term: 'netanyahu', display: 'Netanyahu', baseline: 1 },
  { term: 'iran', display: 'Iran', baseline: 1 },
  { term: 'gaza', display: 'Gaza', baseline: 1.2 },
  { term: 'ukraine', display: 'Ukraine', baseline: 1.5 },
  { term: 'russia', display: 'Russia', baseline: 1.5 },
  { term: 'china', display: 'China', baseline: 1.5 },
  { term: 'taiwan', display: 'Taiwan', baseline: 0.5 },
  { term: 'north korea', display: 'North Korea', baseline: 0.4 },
  { term: 'nato', display: 'NATO', baseline: 0.8 },
  { term: 'tariff', display: 'Tariffs', baseline: 0.6 },
  { term: 'nuclear', display: 'Nuclear', baseline: 0.5 },
  { term: 'sanctions', display: 'Sanctions', baseline: 0.7 },
  { term: 'ceasefire', display: 'Ceasefire', baseline: 0.5 },
  { term: 'missile', display: 'Missile', baseline: 0.4 },
  { term: 'aircraft carrier', display: 'Aircraft Carrier', baseline: 0.2 },
  { term: 'ai ', display: 'AI', baseline: 2 },
  { term: 'openai', display: 'OpenAI', baseline: 0.8 },
  { term: 'bitcoin', display: 'Bitcoin', baseline: 1 },
  { term: 'fed ', display: 'Federal Reserve', baseline: 0.7 },
  { term: 'interest rate', display: 'Interest Rates', baseline: 0.6 },
  { term: 'cyberattack', display: 'Cyberattack', baseline: 0.3 },
  { term: 'cyber attack', display: 'Cyber Attack', baseline: 0.3 },
  { term: 'erdogan', display: 'Erdogan', baseline: 0.4 },
  { term: 'modi', display: 'Modi', baseline: 0.5 },
  { term: 'macron', display: 'Macron', baseline: 0.4 },
  { term: 'houthi', display: 'Houthis', baseline: 0.5 },
  { term: 'hezbollah', display: 'Hezbollah', baseline: 0.5 },
  { term: 'hamas', display: 'Hamas', baseline: 0.8 },
  { term: 'south china sea', display: 'South China Sea', baseline: 0.3 },
  { term: 'election', display: 'Election', baseline: 1 },
  { term: 'recession', display: 'Recession', baseline: 0.4 },
  { term: 'inflation', display: 'Inflation', baseline: 0.6 },
  { term: 'oil price', display: 'Oil Prices', baseline: 0.5 },
];

const MIN_SPIKE_MENTIONS = 3;
const MIN_SPIKE_MULTIPLIER = 2.0;
const MIN_SOURCES = 2;

function detectKeywordSpikes(articles: GdeltArticle[]): KeywordSpike[] {
  const spikes: KeywordSpike[] = [];

  for (const tracked of TRACKED_TERMS) {
    const matchingHeadlines: { title: string; source: string; link: string }[] = [];
    const sources = new Set<string>();

    for (const article of articles) {
      const titleLower = article.title.toLowerCase();
      if (titleLower.includes(tracked.term.toLowerCase())) {
        matchingHeadlines.push({
          title: article.title,
          source: article.domain,
          link: article.url,
        });
        sources.add(article.domain);
      }
    }

    const count = matchingHeadlines.length;
    const uniqueSources = sources.size;

    if (count < MIN_SPIKE_MENTIONS || uniqueSources < MIN_SOURCES) continue;

    // Baseline is daily estimate — compare against it directly (24h window)
    const multiplier = tracked.baseline > 0 ? count / tracked.baseline : count * 10;

    if (multiplier < MIN_SPIKE_MULTIPLIER) continue;

    // Confidence: based on multiplier strength and source diversity
    const multScore = Math.min(multiplier / 20, 0.5); // cap at 0.5
    const sourceScore = Math.min(uniqueSources / 6, 0.3); // cap at 0.3
    const countScore = Math.min(count / 15, 0.2); // cap at 0.2
    const confidence = Math.min(Math.round((multScore + sourceScore + countScore) * 100), 98);

    spikes.push({
      term: tracked.term,
      displayTerm: tracked.display,
      count,
      uniqueSources,
      baselineEstimate: tracked.baseline,
      multiplier: Math.round(multiplier * 10) / 10,
      confidence,
      headlines: matchingHeadlines.slice(0, 6),
      detectedAt: new Date(),
    });
  }

  // Sort by confidence desc, then multiplier desc
  spikes.sort((a, b) => b.confidence - a.confidence || b.multiplier - a.multiplier);
  return spikes.slice(0, 6); // Top 6 spikes
}

// Build a summary paragraph from headlines
function buildSummary(headlines: { title: string }[]): string {
  if (headlines.length === 0) return '';
  // Use top 3 headlines combined into a readable paragraph
  const top = headlines.slice(0, 3).map(h => h.title.replace(/\s+/g, ' ').trim());
  return top.join(' — ');
}

// ===== Signal Context (from World Monitor) =====
const SIGNAL_CONTEXT = {
  keyword_spike: {
    whyItMatters: 'A term is appearing at significantly higher frequency than its baseline across multiple sources, indicating a developing story.',
    action: 'Review related headlines and AI summary, then correlate with country instability and market moves.',
    note: 'Confidence increases with stronger baseline multiplier and broader source diversity.',
  },
};

// ===== Risk Score types (kept for the secondary panel) =====
interface RiskCountry { name: string; code: string; score: number; level: string; trend: string; }
interface StrategicRisk { score: number; level: string; trend: string; contributors: RiskCountry[]; }
interface TheaterPosture { theaterName: string; shortName: string; postureLevel: string; headline: string; totalAircraft: number; totalVessels: number; trend: string; }
interface MacroSignals { verdict: string; bullishCount: number; totalCount: number; signals: Record<string, { status: string; value: number | string }>; }

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
const WM_API = 'https://worldmonitor.app/api';
const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

const levelColor: Record<string, string> = {
  critical: 'text-red-500', high: 'text-red-400', elevated: 'text-orange-400',
  moderate: 'text-yellow-400', normal: 'text-green-400', low: 'text-green-400',
};
const levelBg: Record<string, string> = {
  critical: 'bg-red-500/20', high: 'bg-red-400/20', elevated: 'bg-orange-400/20',
  moderate: 'bg-yellow-400/20', normal: 'bg-green-400/20', low: 'bg-green-400/20',
};
const trendIcon = (trend: string) => {
  if (trend === 'escalating') return <TrendingUp size={10} className="text-red-400" />;
  if (trend === 'de-escalating') return <TrendingDown size={10} className="text-green-400" />;
  return <span className="text-[8px] text-gray-500">—</span>;
};

const Dashboard = () => {
  // Keyword Spike state
  const [spikes, setSpikes] = useState<KeywordSpike[]>([]);
  const [spikeLoading, setSpikeLoading] = useState(true);

  // World Monitor API state (secondary cards)
  const [strategicRisk, setStrategicRisk] = useState<StrategicRisk | null>(null);
  const [hotspots, setHotspots] = useState<RiskCountry[]>([]);
  const [theaters, setTheaters] = useState<TheaterPosture[]>([]);
  const [macro, setMacro] = useState<MacroSignals | null>(null);
  const [wmLoading, setWmLoading] = useState(true);

  // Fetch GDELT headlines and detect keyword spikes
  useEffect(() => {
    const fetchAndAnalyze = async () => {
      setSpikeLoading(true);
      try {
        // Build a targeted query covering geopolitical/conflict/world topics
        const topics = [
          'trump', 'putin', 'zelensky', 'china', 'iran', 'gaza', 'ukraine',
          'russia', 'nato', 'nuclear', 'tariff', 'sanctions', 'missile',
          'bitcoin', 'election', 'ceasefire', 'hamas', 'hezbollah', 'houthi',
          'taiwan', 'north korea', 'military', 'war', 'conflict', 'AI'
        ];
        const topicQuery = topics.map(t => `"${t}"`).join(' OR ');
        const query = `sourcelang:english (${topicQuery})`;
        const url = `${GDELT_API}?query=${encodeURIComponent(query)}&timespan=24h&mode=artlist&maxrecords=250&format=json&sort=hybridrel`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('GDELT fetch failed');
        const data = await res.json();
        const articles: GdeltArticle[] = (data?.articles || []).map((a: any) => ({
          title: a.title || '',
          url: a.url || '',
          domain: a.domain || 'Unknown',
          seendate: a.seendate || '',
        }));
        const detected = detectKeywordSpikes(articles);
        setSpikes(detected);
      } catch (err) {
        console.error('Error fetching GDELT:', err);
      } finally {
        setSpikeLoading(false);
      }
    };
    fetchAndAnalyze();
  }, []);

  // Fetch World Monitor data (secondary)
  useEffect(() => {
    const fetchWm = async () => {
      setWmLoading(true);
      try {
        const [riskRes, theaterRes, macroRes] = await Promise.all([
          fetch(`${CORS_PROXY}${WM_API}/risk-scores`),
          fetch(`${CORS_PROXY}${WM_API}/theater-posture`),
          fetch(`${CORS_PROXY}${WM_API}/macro-signals`),
        ]);
        if (riskRes.ok) { const d = await riskRes.json(); setStrategicRisk(d.strategicRisk || null); setHotspots((d.cii || []).slice(0, 8)); }
        if (theaterRes.ok) { const d = await theaterRes.json(); setTheaters((d.postures || []).slice(0, 6)); }
        if (macroRes.ok) { const d = await macroRes.json(); setMacro({ verdict: d.verdict || '', bullishCount: d.bullishCount || 0, totalCount: d.totalCount || 0, signals: d.signals || {} }); }
      } catch { /* fail silently */ }
      finally { setWmLoading(false); }
    };
    fetchWm();
  }, []);

  const verdictColor: Record<string, string> = { BUY: 'text-green-400', SELL: 'text-red-400', HOLD: 'text-yellow-400' };

  const formatTime = (date: Date) => date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

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

        {/* ===== 🎯 INTELLIGENCE FINDINGS — Keyword Spike Signals ===== */}
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
                <p className="text-xs text-gray-500">Live keyword spike detection · GDELT 24h window</p>
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

          {spikeLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3 p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-36 bg-white/10 rounded"></div>
                    <div className="h-5 w-20 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="flex gap-4">
                    <div className="h-3 w-24 bg-white/5 rounded"></div>
                    <div className="h-3 w-16 bg-white/5 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : spikes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No keyword spikes detected in the last 24 hours.</p>
              <p className="text-gray-600 text-xs mt-1">Signals appear when a term exceeds {MIN_SPIKE_MULTIPLIER}× its baseline frequency across multiple sources.</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {spikes.map((spike, idx) => (
                <div key={idx} className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
                  {/* Signal Header */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-indigo-400">📊 Keyword Spike</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-100">
                        "{spike.displayTerm}" <span className="text-cyan-400 font-medium">Trending</span>
                      </h3>
                      <span className="text-xs text-gray-400">— {spike.count} mentions in 24h</span>
                    </div>
                  </div>

                  {/* Summary / Description */}
                  <div className="px-4 pb-3">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {buildSummary(spike.headlines)}
                    </p>
                  </div>

                  {/* Meta: Confidence + Time */}
                  <div className="px-4 pb-3 flex items-center gap-4 text-xs">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                      Confidence: {spike.confidence}%
                    </span>
                    <span className="text-gray-500">{formatTime(spike.detectedAt)}</span>
                  </div>

                  {/* Stats line */}
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-400">
                      <span className="font-mono text-gray-300">{spike.displayTerm.toLowerCase()}</span>: {spike.count} mentions across {spike.uniqueSources} sources ({spike.multiplier}× baseline)
                    </p>
                  </div>

                  {/* Context: Why it matters / Action / Note */}
                  <div className="border-t border-white/5 px-4 py-3 space-y-2 bg-white/[0.02]">
                    <div className="flex gap-2 text-xs">
                      <span className="text-yellow-400 font-semibold shrink-0">Why it matters:</span>
                      <span className="text-gray-400">{SIGNAL_CONTEXT.keyword_spike.whyItMatters}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-blue-400 font-semibold shrink-0">Action:</span>
                      <span className="text-gray-400">{SIGNAL_CONTEXT.keyword_spike.action}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500 font-semibold shrink-0">Note:</span>
                      <span className="text-gray-500">{SIGNAL_CONTEXT.keyword_spike.note}</span>
                    </div>
                  </div>

                  {/* Related keyword chip */}
                  <div className="px-4 pb-3 pt-1">
                    <span className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-400 font-mono">
                      {spike.term}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== WORLD MONITOR — Risk / Posture / Macro ===== */}
        <div className="mb-8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <Globe size={18} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-gray-200">World Monitor — Risk &amp; Posture</h2>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
          </div>

          {wmLoading ? (
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
                    {hotspots.length === 0 && <p className="text-xs text-gray-500 py-2">No data available</p>}
                  </div>
                </div>

                {/* Column 2: Theater Posture */}
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
                    {theaters.length === 0 && <p className="text-xs text-gray-500 py-2">No data available</p>}
                  </div>
                </div>

                {/* Column 3: Macro Signals */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={14} className="text-green-400" />
                    <h3 className="text-sm font-bold text-gray-200">Macro Signals</h3>
                    {macro && <span className={`text-xs font-bold ${verdictColor[macro.verdict] || 'text-gray-400'}`}>{macro.verdict}</span>}
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
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg"><Activity size={24} className="text-blue-400" /></div>
              <h3 className="font-semibold text-gray-100">System Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Models Loaded</span><span className="font-medium text-green-400">4 Active</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">API Status</span><span className="font-medium text-green-400">Online</span></div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg"><LayoutDashboard size={24} className="text-purple-400" /></div>
              <h3 className="font-semibold text-gray-100">Available Models</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">• Qwen 2.5 Coder (14B)</div>
              <div className="text-gray-300">• DeepSeek Coder V2 (16B)</div>
              <div className="text-gray-300">• DeepSeek R1 (14B)</div>
              <div className="text-gray-300">• Qwen 2.5 (14B)</div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-500/20 rounded-lg"><Settings size={24} className="text-gray-300" /></div>
              <h3 className="font-semibold text-gray-100">Quick Settings</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-briefing-blue text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Manage Preferences</button>
              <button className="w-full py-2 px-4 bg-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">View Logs</button>
            </div>
          </div>
        </div>

        {/* Moltbook Monitoring Section */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg"><Flame size={24} className="text-orange-400" /></div>
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
