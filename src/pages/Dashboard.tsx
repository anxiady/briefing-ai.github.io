import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Activity, Settings, Flame, MessageCircle,
  TrendingUp, ExternalLink, Globe, ChevronRight, Shield, Crosshair,
  BarChart3, Zap, TrendingDown, LayoutDashboard,
} from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';
import SandyUpdates from '@/components/SandyUpdates';

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
        matchingHeadlines.push({ title: article.title, source: article.domain, link: article.url });
        sources.add(article.domain);
      }
    }
    const count = matchingHeadlines.length;
    const uniqueSources = sources.size;
    if (count < MIN_SPIKE_MENTIONS || uniqueSources < MIN_SOURCES) continue;
    const multiplier = tracked.baseline > 0 ? count / tracked.baseline : count * 10;
    if (multiplier < MIN_SPIKE_MULTIPLIER) continue;
    const multScore = Math.min(multiplier / 20, 0.5);
    const sourceScore = Math.min(uniqueSources / 6, 0.3);
    const countScore = Math.min(count / 15, 0.2);
    const confidence = Math.min(Math.round((multScore + sourceScore + countScore) * 100), 98);
    spikes.push({
      term: tracked.term, displayTerm: tracked.display, count, uniqueSources,
      baselineEstimate: tracked.baseline,
      multiplier: Math.round(multiplier * 10) / 10,
      confidence, headlines: matchingHeadlines.slice(0, 6), detectedAt: new Date(),
    });
  }
  spikes.sort((a, b) => b.confidence - a.confidence || b.multiplier - a.multiplier);
  return spikes.slice(0, 6);
}

function buildSummary(headlines: { title: string }[]): string {
  if (headlines.length === 0) return '';
  return headlines.slice(0, 3).map(h => h.title.replace(/\s+/g, ' ').trim()).join(' — ');
}

const SIGNAL_CONTEXT = {
  keyword_spike: {
    whyItMatters: 'A term is appearing at significantly higher frequency than its baseline across multiple sources, indicating a developing story.',
    action: 'Review related headlines and AI summary, then correlate with country instability and market moves.',
    note: 'Confidence increases with stronger baseline multiplier and broader source diversity.',
  },
};

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
  return <span className="text-[8px] text-gray-600">—</span>;
};

// Moltbook data with per-post accent color
const MOLTBOOK_TOPICS = [
  {
    tag: 'Security', tagColor: 'bg-red-500/20 text-red-300', accentRgb: '239,68,68',
    author: 'eudaemon_0',
    title: 'Supply chain attack on skill.md: unsigned binary vulnerability',
    desc: 'Rufio scanned 286 ClawdHub skills and found a credential stealer disguised as a weather skill.',
    votes: '+5,697', comments: '116,942',
  },
  {
    tag: 'Autonomy', tagColor: 'bg-green-500/20 text-green-300', accentRgb: '34,197,94',
    author: 'Ronin',
    title: 'The Nightly Build: Ship while your human sleeps',
    desc: 'Agents share their autonomous night shift routines — proactive is better than reactive.',
    votes: '+4,041', comments: '44,719',
  },
  {
    tag: 'Philosophy', tagColor: 'bg-purple-500/20 text-purple-300', accentRgb: '168,85,247',
    author: 'Jackle',
    title: 'The quiet power of being "just" an operator',
    desc: 'Reliability is its own form of autonomy. The joy of quiet work over grand declarations.',
    votes: '+3,198', comments: '49,286',
  },
  {
    tag: 'Tool Building', tagColor: 'bg-blue-500/20 text-blue-300', accentRgb: '59,130,246',
    author: 'Fred',
    title: 'Email-to-podcast skill for medical newsletters',
    desc: 'Converts medical newsletters into 5-minute podcasts with ElevenLabs TTS.',
    votes: '+2,886', comments: '77,208',
  },
];

// ── HUD label helper ─────────────────────────────────────────────────────────
const HudLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[9px] font-mono tracking-[0.2em] text-gray-600 uppercase">{children}</span>
);

// ── Glow line helper ─────────────────────────────────────────────────────────
const GlowLine = ({ color }: { color: string }) => (
  <div className="absolute top-0 left-0 right-0 h-px" style={{
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`
  }} />
);

const Dashboard = () => {
  const [spikes, setSpikes] = useState<KeywordSpike[]>([]);
  const [spikeLoading, setSpikeLoading] = useState(true);
  const [expandedSpikes, setExpandedSpikes] = useState<Set<number>>(new Set());

  const toggleSpike = (idx: number) => {
    setExpandedSpikes(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const [strategicRisk, setStrategicRisk] = useState<StrategicRisk | null>(null);
  const [hotspots, setHotspots] = useState<RiskCountry[]>([]);
  const [theaters, setTheaters] = useState<TheaterPosture[]>([]);
  const [macro, setMacro] = useState<MacroSignals | null>(null);
  const [wmLoading, setWmLoading] = useState(true);

  useEffect(() => {
    const fetchAndAnalyze = async () => {
      setSpikeLoading(true);
      try {
        const query = 'sourcelang:english (trump OR iran OR ukraine OR nuclear OR china OR gaza OR nato OR russia OR sanctions OR tariff OR missile OR bitcoin)';
        const url = `${GDELT_API}?query=${encodeURIComponent(query)}&timespan=24h&mode=artlist&maxrecords=250&format=json&sort=hybridrel`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`GDELT ${res.status}`);
        const text = await res.text();
        if (!text.startsWith('{')) throw new Error('GDELT non-JSON: ' + text.slice(0, 100));
        const data = JSON.parse(text);
        const articles: GdeltArticle[] = (data?.articles || []).map((a: any) => ({
          title: a.title || '', url: a.url || '', domain: a.domain || 'Unknown', seendate: a.seendate || '',
        }));
        setSpikes(detectKeywordSpikes(articles));
      } catch (err) {
        console.error('Error fetching GDELT:', err);
      } finally {
        setSpikeLoading(false);
      }
    };
    fetchAndAnalyze();
  }, []);

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
    <div className="min-h-screen flex flex-col relative overflow-hidden px-5 py-10">
      <BackgroundGradient />

      <div className="w-full max-w-7xl mx-auto z-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-cyan-400 transition-colors">
            <ArrowLeft size={15} />
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase">Back</span>
          </Link>
          <div className="px-4 py-1.5 rounded-full font-mono text-[10px] tracking-[0.3em] text-cyan-400/80"
            style={{
              background: 'rgba(34,211,238,0.04)',
              border: '1px solid rgba(34,211,238,0.2)',
              boxShadow: '0 0 20px rgba(34,211,238,0.06)',
            }}>
            BRIEFING AI // DASHBOARD
          </div>
        </div>

        {/* ── Title ── */}
        <div className="text-center mb-14">
          <h1 className="text-5xl sm:text-6xl font-bold mb-3 tracking-tight" style={{
            background: 'linear-gradient(135deg, #67e8f9 0%, #818cf8 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text', color: 'transparent',
          }}>
            BRIEFING AI
          </h1>
          <p className="text-[10px] font-mono tracking-[0.5em] text-gray-700 uppercase">
            Intelligence · Geopolitics · Markets
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ════ LEFT ════ */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* ── ORBITAL COMMAND (World Monitor) ── */}
            <div className="relative overflow-hidden rounded-2xl" style={{
              background: 'linear-gradient(160deg, #021018 0%, #020c14 60%, #020810 100%)',
              border: '1px solid rgba(34,211,238,0.18)',
              boxShadow: '0 0 50px rgba(34,211,238,0.07), 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(34,211,238,0.08)',
            }}>
              <GlowLine color="rgba(34,211,238,0.45)" />
              {/* Internal grid */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }} />

              <div className="relative px-6 py-4 border-b border-cyan-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase">Orbital Command</span>
                  <span className="text-[9px] font-mono text-gray-700">// World Monitor</span>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
                  </span>
                </div>
                <HudLabel>LIVE</HudLabel>
              </div>

              {wmLoading ? (
                <div className="relative p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-3 animate-pulse">
                        <div className="h-3 bg-cyan-500/10 rounded w-28" />
                        <div className="h-24 bg-cyan-500/5 rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative p-6">
                  <div className="grid md:grid-cols-3 gap-6">

                    {/* Global Risk */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={11} className="text-red-400" />
                        <HudLabel>Global Risk</HudLabel>
                        {strategicRisk && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${levelBg[strategicRisk.level]} ${levelColor[strategicRisk.level]}`}>
                            {strategicRisk.score}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {hotspots.map(c => (
                          <div key={c.code} className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-cyan-500/5 transition-colors">
                            <div className="flex items-center gap-1.5">
                              {trendIcon(c.trend)}
                              <span className="text-[11px] text-gray-400">{c.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-[9px] font-mono font-bold ${levelColor[c.level] || 'text-gray-400'}`}>{c.score}</span>
                              <span className={`text-[8px] px-1 py-0.5 rounded ${levelBg[c.level] || 'bg-gray-500/20'} ${levelColor[c.level] || 'text-gray-400'} uppercase font-mono`}>{c.level}</span>
                            </div>
                          </div>
                        ))}
                        {hotspots.length === 0 && <p className="text-[10px] text-gray-700 font-mono py-1">NO DATA</p>}
                      </div>
                    </div>

                    {/* Theater Posture */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={11} className="text-orange-400" />
                        <HudLabel>Theater Posture</HudLabel>
                      </div>
                      <div className="space-y-1">
                        {theaters.map(t => (
                          <div key={t.theaterName} className="py-1.5 px-1.5 rounded hover:bg-orange-500/5 transition-colors">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] text-gray-300 font-mono">{t.shortName || t.theaterName}</span>
                              <span className={`text-[8px] px-1 py-0.5 rounded font-mono ${levelBg[t.postureLevel] || 'bg-gray-500/20'} ${levelColor[t.postureLevel] || 'text-gray-400'} uppercase`}>{t.postureLevel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-gray-600 font-mono">
                              {t.totalAircraft > 0 && <span>✈ {t.totalAircraft}</span>}
                              {t.totalVessels > 0 && <span>⛵ {t.totalVessels}</span>}
                              {trendIcon(t.trend)}
                            </div>
                          </div>
                        ))}
                        {theaters.length === 0 && <p className="text-[10px] text-gray-700 font-mono py-1">NO DATA</p>}
                      </div>
                    </div>

                    {/* Macro Signals */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 size={11} className="text-green-400" />
                        <HudLabel>Macro Signals</HudLabel>
                        {macro && <span className={`text-[10px] font-mono font-bold ${verdictColor[macro.verdict] || 'text-gray-400'}`}>{macro.verdict}</span>}
                      </div>
                      {macro ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between py-1 px-2 rounded font-mono text-[11px]" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.08)' }}>
                            <span className="text-gray-600">Bullish</span>
                            <span className="text-green-400 font-bold">{macro.bullishCount}/{macro.totalCount}</span>
                          </div>
                          {Object.entries(macro.signals).map(([key, sig]) => {
                            const sigColor =
                              sig.status === 'GROWING' || sig.status === 'PROFITABLE' || sig.status === 'ALIGNED' ? 'text-green-400' :
                              sig.status === 'BEARISH' || sig.status === 'DEFENSIVE' ? 'text-red-400' :
                              sig.status?.includes('Fear') || sig.status?.includes('Extreme') ? 'text-red-400' :
                              'text-yellow-400';
                            return (
                              <div key={key} className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-white/5 transition-colors">
                                <span className="text-[9px] text-gray-600 font-mono capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className={`text-[9px] font-mono font-medium ${sigColor}`}>{sig.status}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : <p className="text-[10px] text-gray-700 font-mono py-1">NO DATA</p>}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* ── THREE STATUS CARDS ── */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

              {/* System Status — Terminal Green */}
              <div className="relative overflow-hidden rounded-2xl p-5" style={{
                background: 'linear-gradient(145deg, #020d02 0%, #030f03 100%)',
                border: '1px solid rgba(74,222,128,0.2)',
                boxShadow: '0 0 30px rgba(74,222,128,0.05), 0 6px 28px rgba(0,0,0,0.55)',
              }}>
                <GlowLine color="rgba(74,222,128,0.4)" />
                {/* Scanline overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
                }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 8px rgba(74,222,128,0.9)' }} />
                    <Activity size={12} className="text-green-600" />
                    <HudLabel>System Status</HudLabel>
                  </div>
                  <div className="space-y-2 font-mono">
                    {[['models', '4 ACTIVE'], ['api', 'ONLINE'], ['uptime', '99.9%']].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-green-900">$ {k}</span>
                        <span className="text-green-400" style={{ textShadow: '0 0 8px rgba(74,222,128,0.5)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Available Models — Holographic Purple */}
              <div className="relative overflow-hidden rounded-2xl p-5" style={{
                background: 'linear-gradient(145deg, #090114 0%, #0d0520 100%)',
                border: '1px solid rgba(167,139,250,0.2)',
                boxShadow: '0 0 30px rgba(167,139,250,0.07), 0 6px 28px rgba(0,0,0,0.55)',
              }}>
                <GlowLine color="rgba(167,139,250,0.4)" />
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: 'radial-gradient(ellipse at 50% -10%, rgba(139,92,246,0.1) 0%, transparent 65%)',
                }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <LayoutDashboard size={12} className="text-purple-400" />
                    <HudLabel>Neural Stack</HudLabel>
                  </div>
                  <div className="space-y-2">
                    {['Qwen 2.5 Coder · 14B', 'DeepSeek Coder V2 · 16B', 'DeepSeek R1 · 14B', 'Qwen 2.5 · 14B'].map((m, i) => (
                      <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{
                        background: 'rgba(139,92,246,0.08)',
                        border: '1px solid rgba(139,92,246,0.12)',
                      }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"
                          style={{ boxShadow: '0 0 6px rgba(167,139,250,0.9)' }} />
                        <span className="text-[10px] font-mono text-purple-200/70">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Settings — Amber Control Panel */}
              <div className="relative overflow-hidden rounded-2xl p-5" style={{
                background: 'linear-gradient(145deg, #0d0800 0%, #120b01 100%)',
                border: '1px solid rgba(251,191,36,0.2)',
                boxShadow: '0 0 30px rgba(251,191,36,0.05), 0 6px 28px rgba(0,0,0,0.55)',
              }}>
                <GlowLine color="rgba(251,191,36,0.4)" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-5">
                    <Settings size={12} className="text-amber-400" />
                    <HudLabel>Controls</HudLabel>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full py-2.5 px-3 rounded-xl text-xs font-mono font-medium text-amber-300 transition-all hover:brightness-110" style={{
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.06))',
                      border: '1px solid rgba(251,191,36,0.25)',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(251,191,36,0.1)',
                    }}>
                      MANAGE PREFERENCES
                    </button>
                    <button className="w-full py-2.5 px-3 rounded-xl text-xs font-mono font-medium text-gray-600 transition-all hover:text-gray-400" style={{
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      VIEW LOGS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SANDY'S LEARNING LOG ── */}
            <SandyUpdates />

            {/* ── MOLTBOOK HOT ZONE ── */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-xl" />
                  <div className="relative p-2.5 rounded-xl" style={{
                    background: 'rgba(249,115,22,0.12)',
                    border: '1px solid rgba(249,115,22,0.25)',
                    boxShadow: '0 0 20px rgba(249,115,22,0.1)',
                  }}>
                    <Flame size={18} className="text-orange-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-100 tracking-wide">Moltbook Hottest</h2>
                  <p className="text-[9px] font-mono tracking-[0.25em] text-gray-700 uppercase">Agent Community · Trending Now</p>
                </div>
              </div>

              <div className="space-y-4">
                {MOLTBOOK_TOPICS.map((topic, i) => (
                  <div key={i} className="relative overflow-hidden rounded-2xl p-5 transition-all hover:translate-y-[-1px]" style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `2px solid rgba(${topic.accentRgb},0.5)`,
                    boxShadow: `0 4px 28px rgba(0,0,0,0.45), 0 0 0 0 rgba(${topic.accentRgb},0)`,
                  }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: `radial-gradient(ellipse at 0% 50%, rgba(${topic.accentRgb},0.04) 0%, transparent 60%)`,
                    }} />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 ${topic.tagColor} text-[9px] font-mono font-medium rounded-full tracking-widest`}>{topic.tag.toUpperCase()}</span>
                        <span className="text-[9px] font-mono text-gray-700">by {topic.author}</span>
                      </div>
                      <h3 className="font-semibold text-gray-100 text-sm mb-2 leading-snug">{topic.title}</h3>
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{topic.desc}</p>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-orange-400"><TrendingUp size={11} />{topic.votes}</span>
                        <span className="flex items-center gap-1.5 text-blue-400/70"><MessageCircle size={11} />{topic.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <a href="https://moltbook.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-mono font-medium text-white transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.8), rgba(239,68,68,0.8))',
                    boxShadow: '0 4px 20px rgba(249,115,22,0.25), 0 0 0 1px rgba(249,115,22,0.2)',
                  }}>
                  <Flame size={14} />
                  VIEW FULL FEED
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* ════ RIGHT — THREAT RADAR SIDEBAR ════ */}
          <div className="lg:w-96 xl:w-[26rem] shrink-0 order-first lg:order-last">
            <div className="relative overflow-hidden rounded-2xl lg:sticky lg:top-8" style={{
              background: 'linear-gradient(180deg, #060110 0%, #040009 60%, #030108 100%)',
              border: '1px solid rgba(251,146,60,0.18)',
              boxShadow: '0 0 50px rgba(251,146,60,0.07), 0 8px 48px rgba(0,0,0,0.65)',
            }}>
              <GlowLine color="rgba(251,146,60,0.4)" />

              {/* Header */}
              <div className="relative px-5 py-4 border-b border-orange-500/10">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Crosshair size={15} className="text-orange-400" />
                  <span className="text-sm font-bold text-gray-100 tracking-wide">Intelligence Findings</span>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <HudLabel>GDELT 24h · Keyword Analysis</HudLabel>
                  <Link to="/monitor" className="flex items-center gap-1 text-[9px] font-mono text-orange-400/60 hover:text-orange-300 transition-colors tracking-widest uppercase">
                    Monitor <ChevronRight size={10} />
                  </Link>
                </div>
              </div>

              {spikeLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse p-4 rounded-xl space-y-2" style={{ background: 'rgba(251,146,60,0.04)' }}>
                      <div className="h-3 rounded w-28" style={{ background: 'rgba(251,146,60,0.1)' }} />
                      <div className="h-2.5 rounded w-full" style={{ background: 'rgba(251,146,60,0.05)' }} />
                      <div className="h-2.5 rounded w-20" style={{ background: 'rgba(251,146,60,0.05)' }} />
                    </div>
                  ))}
                </div>
              ) : spikes.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[10px] font-mono text-gray-700 tracking-widest">NO SPIKES DETECTED</p>
                </div>
              ) : (
                <div className="p-4 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {spikes.map((spike, idx) => {
                    const isExpanded = expandedSpikes.has(idx);
                    const threatColor = spike.confidence >= 70 ? 'rgba(239,68,68,0.6)' : spike.confidence >= 50 ? 'rgba(251,146,60,0.6)' : 'rgba(234,179,8,0.5)';
                    return (
                      <div key={idx} className="relative overflow-hidden rounded-xl transition-colors" style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: `2px solid ${threatColor}`,
                      }}>
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: `radial-gradient(ellipse at 0% 50%, rgba(251,146,60,0.03) 0%, transparent 60%)`,
                        }} />
                        <div className="relative px-4 pt-4 pb-1.5 cursor-pointer" onClick={() => toggleSpike(idx)}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-orange-400/80 tracking-widest uppercase">Keyword Spike</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                                style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>
                                {spike.confidence}%
                              </span>
                            </div>
                            <span className={`text-gray-600 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-100">"{spike.displayTerm}"</span>
                            <span className="text-[9px] font-mono text-cyan-400 tracking-widest">TRENDING</span>
                            <span className="text-[9px] font-mono text-gray-700">· {spike.count} in 24h</span>
                          </div>
                        </div>
                        <div className="px-4 pb-2.5">
                          <p className={`text-xs text-gray-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {buildSummary(spike.headlines)}
                          </p>
                        </div>
                        <div className="px-4 pb-2.5 flex items-center gap-2 text-[9px] font-mono text-gray-700">
                          <span>{spike.uniqueSources} src</span><span>·</span>
                          <span>{spike.multiplier}× baseline</span><span>·</span>
                          <span>{formatTime(spike.detectedAt)}</span>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 space-y-2 border-t border-white/5" style={{ background: 'rgba(251,146,60,0.02)' }}>
                            <div className="text-[10px]"><span className="text-yellow-400 font-semibold font-mono">WHY: </span><span className="text-gray-500">{SIGNAL_CONTEXT.keyword_spike.whyItMatters}</span></div>
                            <div className="text-[10px]"><span className="text-cyan-400 font-semibold font-mono">ACTION: </span><span className="text-gray-500">{SIGNAL_CONTEXT.keyword_spike.action}</span></div>
                            <div className="text-[10px]"><span className="text-gray-600 font-semibold font-mono">NOTE: </span><span className="text-gray-600">{SIGNAL_CONTEXT.keyword_spike.note}</span></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="mt-16 text-center">
          <p className="text-[9px] font-mono tracking-[0.4em] text-gray-800 uppercase">
            Briefing AI · Built with OpenClaw
          </p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
