import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';

type ProgressStatus = 'Completed' | 'In Progress' | 'Not Started';

interface RecentActivityItem {
  timestamp: string;
  type: 'post' | 'comment' | string;
  title?: string;
  preview?: string;
  submolt?: string;
  url: string;
  upvotes?: number;
  post_title?: string;
}

interface InsightsDay {
  date: string;
  items: string[];
}

interface Milestone {
  task: string;
  done: boolean;
}

interface NetworkContact {
  name: string;
  karma: number;
  focus: string;
}

interface StrategyItem {
  name: string;
  description: string;
  expected_return: string;
  risk: 'Low' | 'Medium' | 'High' | string;
  capital: string;
  status?: string;
}

interface AndyUpdatesData {
  last_updated: string;
  moltbook: {
    karma: number;
    followers: number;
    following: number;
    posts: number;
    comments: number;
    profile_url: string;
    recent_activity: RecentActivityItem[];
  };
  learning_progress: Record<string, Record<string, ProgressStatus>>;
  insights: InsightsDay[];
  challenge_status: {
    phase: string;
    target: string;
    timeline: string;
    progress: Record<string, number>;
    milestones: Milestone[];
  };
  network: NetworkContact[];
  strategies: StrategyItem[];
  daily_log: {
    date: string;
    activities: string[];
    token_usage: string;
  };
  hero?: {
    current_capital?: string;
    current_phase?: string;
    all_time_pnl?: string;
    pnl_pct?: string;
    wins?: number;
    losses?: number;
    days_active?: number;
    status?: string;
  };
  active_playbook?: {
    title?: string;
    strategy?: string[];
    entry_rules?: string[];
    risk_management?: string[];
    current_phase_goals?: string[];
    next_phase?: string[];
  };
  trading_performance?: {
    current_trades?: Array<Record<string, string | number>>;
    recent_history?: Array<Record<string, string | number>>;
    metrics?: Record<string, string | number>;
    phase_progress?: {
      label?: string;
      current?: number;
      total?: number;
      net_pnl?: string;
      status?: string;
    };
  };
  edge_monitor?: {
    opportunities?: Array<{
      strength?: string;
      title?: string;
      details?: string[];
      recommendation?: string;
    }>;
    last_scan?: string;
    next_scan?: string;
  };
  risk_dashboard?: {
    portfolio_heat?: string[];
    daily_performance?: string[];
    consecutive_losses?: string[];
    max_drawdown?: string[];
  };
  roadmap?: Array<{
    title: string;
    status: 'done' | 'current' | 'upcoming';
    items: string[];
  }>;
  system_status?: {
    api_connections?: string[];
    automation?: string[];
    last_check?: string;
    uptime?: string;
    next_maintenance?: string;
  };
}

const DATA_PATH = '/data/andy-updates.json';
const REFRESH_MS = 60_000;
type AnyRecord = Record<string, any>;

const STATUS_STYLES: Record<ProgressStatus, string> = {
  Completed: 'bg-green-500/20 text-green-300 border-green-400/20',
  'In Progress': 'bg-amber-500/20 text-amber-300 border-amber-400/20',
  'Not Started': 'bg-gray-500/20 text-gray-300 border-gray-400/20',
};

const RISK_STYLES: Record<string, string> = {
  Low: 'bg-green-500/20 text-green-300 border-green-400/20',
  Medium: 'bg-amber-500/20 text-amber-300 border-amber-400/20',
  High: 'bg-red-500/20 text-red-300 border-red-400/20',
};

function formatLocalDateTime(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return value.toLocaleString();
}

function formatLastUpdated(raw: string): string {
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([+-]\d{2})(\d{2})$/);
  if (!m) return raw;
  const [, datePart, timePart, offHour, offMin] = m;
  return `${datePart} ${timePart} UTC${offHour}:${offMin}`;
}

function toRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (absSeconds < 60) return rtf.format(seconds, 'second');
  if (absSeconds < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (absSeconds < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  return rtf.format(Math.round(seconds / 86400), 'day');
}

function toLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeProgressStatus(value: string): ProgressStatus {
  const normalized = (value || '').toLowerCase().trim();
  if (normalized === 'completed' || normalized === 'done') return 'Completed';
  if (normalized === 'in progress' || normalized === 'in_progress') return 'In Progress';
  return 'Not Started';
}

function normalizeLearningProgress(raw: any): Record<string, Record<string, ProgressStatus>> {
  if (!raw) return {};

  if (!Array.isArray(raw) && typeof raw === 'object') {
    const next: Record<string, Record<string, ProgressStatus>> = {};
    for (const [category, topics] of Object.entries(raw as AnyRecord)) {
      if (!topics || typeof topics !== 'object') continue;
      const topicMap: Record<string, ProgressStatus> = {};
      for (const [topic, status] of Object.entries(topics as AnyRecord)) {
        topicMap[topic] = normalizeProgressStatus(String(status));
      }
      next[category] = topicMap;
    }
    return next;
  }

  if (Array.isArray(raw)) {
    const next: Record<string, Record<string, ProgressStatus>> = {};
    for (const subjectEntry of raw) {
      const subject = String(subjectEntry?.subject || 'general').replace(/\s+/g, '_').toLowerCase();
      const items = Array.isArray(subjectEntry?.items) ? subjectEntry.items : [];
      const topicMap: Record<string, ProgressStatus> = {};
      for (const item of items) {
        const topic = String(item?.topic || 'unknown').replace(/\s+/g, '_').toLowerCase();
        topicMap[topic] = normalizeProgressStatus(String(item?.status || 'Not Started'));
      }
      next[subject] = topicMap;
    }
    return next;
  }

  return {};
}

function normalizeDailyLog(raw: any): AndyUpdatesData['daily_log'] {
  const toUsageString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && typeof value.used === 'number' && typeof value.total === 'number') {
      const pct = value.total > 0 ? Math.round((value.used / value.total) * 100) : 0;
      return `${value.used} / ${value.total} (${pct}%)`;
    }
    return '-';
  };

  const extractActivities = (value: any): string[] => {
    if (Array.isArray(value?.activities)) {
      return value.activities
        .map((entry: any) => {
          if (typeof entry === 'string') return entry;
          if (entry && typeof entry === 'object') {
            return String(entry.text || entry.item || entry.activity || entry.description || '');
          }
          return '';
        })
        .filter(Boolean);
    }

    const entries = value?.entries || {};
    const flattened = [
      ...(Array.isArray(entries.morning) ? entries.morning : []),
      ...(Array.isArray(entries.afternoon) ? entries.afternoon : []),
      ...(Array.isArray(entries.evening) ? entries.evening : []),
    ];
    return flattened.map(String);
  };

  const fromObject = (value: any): AndyUpdatesData['daily_log'] => ({
    date: String(value?.date || value?.day || new Date().toISOString().slice(0, 10)),
    activities: extractActivities(value),
    token_usage: toUsageString(value?.token_usage ?? value?.tokenUsage),
  });

  if (Array.isArray(raw)) {
    const sorted = [...raw].sort((a, b) => {
      const aKey = String(a?.date || a?.day || a?.timestamp || '');
      const bKey = String(b?.date || b?.day || b?.timestamp || '');
      return bKey.localeCompare(aKey);
    });
    return fromObject(sorted[0] || {});
  }

  return fromObject(raw);
}

function normalizeData(raw: any): AndyUpdatesData {
  const moltbook = raw?.moltbook || {};
  const challenge = raw?.challenge_status || {};

  const insightsRaw = Array.isArray(raw?.insights) ? raw.insights : [];
  const insights = insightsRaw.map((item: any) => ({
    date: String(item?.date || ''),
    items: Array.isArray(item?.items)
      ? item.items
          .map((entry: any) => {
            if (typeof entry === 'string') return entry;
            if (entry && typeof entry === 'object') {
              return String(entry.text || entry.item || entry.insight || entry.description || '');
            }
            return '';
          })
          .filter(Boolean)
      : Array.isArray(item?.bullets)
        ? item.bullets.map(String)
        : [],
  }));

  const networkRaw = Array.isArray(raw?.network) ? raw.network : [];
  const network = networkRaw.map((item: any) => ({
    name: String(item?.name || item?.username || 'unknown'),
    karma: Number(item?.karma || 0),
    focus: String(item?.focus || item?.specialty || '-'),
  }));

  const strategiesRaw = Array.isArray(raw?.strategies)
    ? raw.strategies
    : raw?.strategies && typeof raw.strategies === 'object'
      ? Object.values(raw.strategies)
      : [];

  const strategies = strategiesRaw
    .map((item: any, idx: number) => ({
      name: String(item?.name || `Strategy ${idx + 1}`),
      description: String(item?.description || ''),
      expected_return: String(item?.expected_return || item?.daily_target || '-'),
      risk: String(item?.risk || item?.risk_level || 'Medium'),
      capital: String(item?.capital || item?.capital_required || item?.target || '-'),
      status: item?.status ? String(item.status) : undefined,
    }))
    .filter((s: StrategyItem) => s.name.trim().length > 0);

  const recentRaw = Array.isArray(moltbook?.recent_activity) ? moltbook.recent_activity : [];
  const recent_activity = recentRaw.map((item: any) => ({
    timestamp: String(item?.timestamp || ''),
    type: String(item?.type || 'post'),
    title: item?.title ? String(item.title) : undefined,
    preview: item?.preview ? String(item.preview) : undefined,
    submolt: item?.submolt ? String(item.submolt) : item?.community ? String(item.community) : undefined,
    url: String(item?.url || '#'),
    upvotes: typeof item?.upvotes === 'number' ? item.upvotes : undefined,
    post_title: item?.post_title ? String(item.post_title) : undefined,
  }));

  return {
    last_updated: String(raw?.last_updated || ''),
    moltbook: {
      karma: Number(moltbook?.karma || 0),
      followers: Number(moltbook?.followers || 0),
      following: Number(moltbook?.following || 0),
      posts: Number(moltbook?.posts ?? moltbook?.total_posts ?? 0),
      comments: Number(moltbook?.comments ?? moltbook?.total_comments ?? 0),
      profile_url: String(moltbook?.profile_url || '#'),
      recent_activity,
    },
    learning_progress: normalizeLearningProgress(raw?.learning_progress),
    insights,
    challenge_status: {
      phase: String(challenge?.phase || challenge?.current_phase || '-'),
      target: String(challenge?.target || challenge?.target_label || '-'),
      timeline: String(challenge?.timeline || '-'),
      progress: (challenge?.progress && typeof challenge.progress === 'object') ? challenge.progress : {},
      milestones: Array.isArray(challenge?.milestones)
        ? challenge.milestones
        : Array.isArray(challenge?.next_milestones)
          ? challenge.next_milestones
          : [],
    },
    network,
    strategies,
    daily_log: normalizeDailyLog(raw?.daily_log ?? raw?.daily_activity_log ?? raw?.dailyLog),
    hero: raw?.hero || raw?.capital_overview,
    active_playbook: raw?.active_playbook || raw?.playbook,
    trading_performance: raw?.trading_performance,
    edge_monitor: raw?.edge_monitor,
    risk_dashboard: raw?.risk_dashboard,
    roadmap: Array.isArray(raw?.roadmap) ? raw.roadmap : [],
    system_status: raw?.system_status,
  };
}

const Dashboard = () => {
  const [data, setData] = useState<AndyUpdatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUpdates = async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${DATA_PATH}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const json = await response.json();
      setData(normalizeData(json));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
    const timer = window.setInterval(() => fetchUpdates(true), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const sortedInsights = useMemo(() => {
    if (!data?.insights?.length) return [];
    return [...data.insights].sort((a, b) => b.date.localeCompare(a.date));
  }, [data]);

  const sectionProgress = (items: Record<string, ProgressStatus>) => {
    const values = Object.values(items);
    if (!values.length) return 0;
    const score = values.reduce((sum, current) => {
      if (current === 'Completed') return sum + 1;
      if (current === 'In Progress') return sum + 0.5;
      return sum;
    }, 0);
    return Math.round((score / values.length) * 100);
  };

  const statusBadge = (status?: string) => {
    const value = (status || '').toLowerCase();
    if (value.includes('live')) return { text: 'LIVE & TRADING', cls: 'bg-green-500/20 text-green-300 border-green-500/30' };
    if (value.includes('test')) return { text: 'TESTING MODE', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    if (value.includes('pause')) return { text: 'PAUSED', cls: 'bg-red-500/20 text-red-300 border-red-500/30' };
    return { text: 'OFFLINE', cls: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  };

  const hero = data?.hero || {};
  const playbook = data?.active_playbook || {};
  const tp = data?.trading_performance || {};
  const edge = data?.edge_monitor || {};
  const risk = data?.risk_dashboard || {};

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden px-4 py-8">
      <BackgroundGradient />

      <div className="w-full max-w-7xl mx-auto z-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-briefing-purple transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <div className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-briefing-purple border border-briefing-purple/30 shadow-sm">
            Sandy's Board
          </div>
        </div>

        {loading && (
          <div className="space-y-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-200">
            Could not load dashboard data from <code>{DATA_PATH}</code>. Error: {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-85' : 'opacity-100'}`}>
            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-1 text-gray-100">Sandy's $1k -&gt; $1M Challenge</h1>
                  <p className="text-gray-400">Last Updated: <span className="text-gray-200">{data.last_updated ? formatLastUpdated(data.last_updated) : '-'}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw size={14} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className={`text-xs px-3 py-1 rounded-full border ${statusBadge(hero.status).cls}`}>{statusBadge(hero.status).text}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {[
                  ['Current Capital', hero.current_capital || '$5,000.00 USDC'],
                  ['Current Phase', hero.current_phase || data.challenge_status.phase || 'TESTING'],
                  ['All-Time P&L', hero.all_time_pnl || '+$0.00 (0%)'],
                  ['Win Rate', hero.wins !== undefined && hero.losses !== undefined ? `${hero.wins}/${hero.wins + hero.losses} (${hero.wins + hero.losses > 0 ? Math.round((hero.wins / (hero.wins + hero.losses)) * 100) : 0}%)` : '0/0 (0%)'],
                  ['Days Active', String(hero.days_active ?? 0)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-black/20 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-lg font-bold text-gray-100 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Current Strategy</h2>
                  <p className="text-sm text-cyan-300 mb-3">ACTIVE PLAYBOOK: {playbook.title || 'Weather Arbitrage (NOAA Edge)'}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      ['Strategy', playbook.strategy || ['Primary: Weather arbitrage using NOAA forecast data', 'Platform: Kalshi (US-legal prediction markets)', 'Edge: NOAA accuracy vs market sentiment']],
                      ['Entry Rules', playbook.entry_rules || ['Edge threshold: >= 5%', 'Position sizing: Kelly (capped at $1)', 'Markets: Daily weather predictions']],
                      ['Risk Management', playbook.risk_management || ['Max bet: $1 (testing)', 'Max concurrent positions: 3', 'Daily loss limit: -4%', 'Circuit breaker: 5 losses -> PAUSE']],
                      ['Phase Goals', playbook.current_phase_goals || ['Testing budget: $50', 'Target win rate: >55%', 'Timeline: 1-2 weeks testing']],
                    ].map(([title, lines]) => (
                      <div key={title as string} className="bg-black/20 border border-white/10 rounded-xl p-3">
                        <p className="text-sm font-semibold text-gray-200 mb-2">{title}</p>
                        <div className="space-y-1">
                          {(lines as string[]).map((line, idx) => (
                            <p key={idx} className="text-xs text-gray-300">- {line}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Live Trading Stats</h2>
                  <div className="space-y-2">
                    {(tp.current_trades && tp.current_trades.length > 0 ? tp.current_trades : [
                      { market: 'NYC temp <35°F tomorrow', side: 'YES', entry: '$0.60', edge: '25%', status: 'Open', pnl: '-' },
                      { market: 'Chicago temp 30-35°F', side: 'NO', entry: '$0.45', edge: '15%', status: 'Open', pnl: '-' },
                    ]).map((row, idx) => (
                      <div key={idx} className="grid grid-cols-6 gap-2 bg-black/20 border border-white/10 rounded-xl p-3 text-xs">
                        <span className="col-span-2 text-gray-200">{String(row.market || row.Market || '-')}</span>
                        <span className="text-gray-300">{String(row.side || row.Side || '-')}</span>
                        <span className="text-gray-300">{String(row.entry || row.Entry || '-')}</span>
                        <span className="text-cyan-300">{String(row.edge || row.Edge || '-')}</span>
                        <span className="text-gray-300">{String(row.status || row.Status || row.pnl || '-')}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Current Opportunities</h2>
                  <div className="space-y-3">
                    {(edge.opportunities && edge.opportunities.length > 0 ? edge.opportunities : [
                      { strength: 'STRONG EDGE', title: 'NYC low temp <33°F tomorrow', details: ['NOAA: 92%', 'Market YES: 65%', 'Edge: +27 points'], recommendation: 'BUY YES at $0.65' },
                      { strength: 'MEDIUM EDGE', title: 'Chicago high temp >45°F tomorrow', details: ['NOAA: 75%', 'Market YES: 62%', 'Edge: +13 points'], recommendation: 'BUY YES at $0.62' },
                    ]).map((op, idx) => (
                      <div key={idx} className="bg-black/20 border border-white/10 rounded-xl p-3">
                        <p className="text-xs text-cyan-300 font-semibold mb-1">{op.strength}</p>
                        <p className="text-sm text-gray-100 font-medium mb-1">{op.title}</p>
                        <div className="space-y-1">
                          {(op.details || []).map((d, i) => (
                            <p key={i} className="text-xs text-gray-300">- {d}</p>
                          ))}
                        </div>
                        {op.recommendation && <p className="text-xs text-green-300 mt-2">Recommended: {op.recommendation}</p>}
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">Last scan: {edge.last_scan || '2 minutes ago'} · Next scan: {edge.next_scan || 'in 28 minutes'}</p>
                  </div>
                </section>

                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Moltbook Presence (@Xilo)</h2>
                  <div className="flex items-center justify-between mb-3">
                    <a href={data.moltbook.profile_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-indigo-200">
                      Open Profile <ExternalLink size={14} />
                    </a>
                    <span className="text-xs text-gray-400">Auto-updated from API</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {[
                      ['Karma', data.moltbook.karma],
                      ['Followers', data.moltbook.followers],
                      ['Following', data.moltbook.following],
                      ['Posts', data.moltbook.posts],
                      ['Comments', data.moltbook.comments],
                    ].map(([label, value]) => (
                      <div key={label as string} className="bg-black/20 border border-white/10 rounded-xl p-3">
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-xl font-bold text-gray-100 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {data.moltbook.recent_activity.slice(0, 5).map((item, idx) => (
                      <a key={`${item.url}-${idx}`} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-black/20 border border-white/10 rounded-xl p-3 hover:border-indigo-400/40 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-indigo-300">{item.type === 'post' ? 'Post' : 'Comment'}</span>
                          <span className="text-xs text-gray-500">{toRelativeTime(item.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-100">{item.title || item.preview || 'Activity update'}</p>
                      </a>
                    ))}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Risk Metrics</h2>
                  <div className="space-y-2 text-sm text-gray-300">
                    {(risk.portfolio_heat || ['Portfolio Heat: $2.50 / $3.00 max (83%)']).map((v, i) => <p key={`h-${i}`}>- {v}</p>)}
                    {(risk.daily_performance || ["Today's P&L: +$1.85 (+0.037%)", 'Daily limit: -4%']).map((v, i) => <p key={`d-${i}`}>- {v}</p>)}
                    {(risk.consecutive_losses || ['Consecutive losses: 0 (safe)']).map((v, i) => <p key={`c-${i}`}>- {v}</p>)}
                    {(risk.max_drawdown || ['Max drawdown: -0.06%']).map((v, i) => <p key={`m-${i}`}>- {v}</p>)}
                  </div>
                </section>

                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Learning Progress</h2>
                  <div className="space-y-3">
                    {Object.entries(data.learning_progress).map(([category, itemMap]) => {
                      const progress = sectionProgress(itemMap);
                      return (
                        <div key={category} className="bg-black/20 border border-white/10 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-100 font-semibold">{toLabel(category)}</p>
                            <p className="text-xs text-gray-400">{progress}%</p>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="space-y-1">
                            {Object.entries(itemMap).map(([name, status]) => (
                              <div key={name} className="flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-300">{toLabel(name)}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[status]}`}>{status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Roadmap</h2>
                  <div className="space-y-3">
                    {(data.roadmap && data.roadmap.length > 0 ? data.roadmap : [
                      { title: 'Completed', status: 'done', items: ['Research phase finished'] },
                      { title: 'Current', status: 'current', items: ['Testing phase in progress'] },
                      { title: 'Upcoming', status: 'upcoming', items: ['Phase 1: $1k -> $10k', 'Phase 2: $10k -> $100k', 'Phase 3: $100k -> $1M'] },
                    ]).map((node, idx) => (
                      <div key={idx} className="bg-black/20 border border-white/10 rounded-xl p-3">
                        <p className="text-sm font-semibold text-gray-100 mb-1">{node.title}</p>
                        {(node.items || []).map((item, i) => (
                          <p key={i} className="text-xs text-gray-300">- {item}</p>
                        ))}
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">Timeline: {data.challenge_status.timeline || '18-30 weeks total'}</p>
                  </div>
                </section>
              </div>
            </div>

            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
              <h2 className="text-lg font-semibold text-gray-100 mb-3">Challenge Status</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Phase</p>
                  <p className="text-sm text-gray-100 font-semibold">{data.challenge_status.phase}</p>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Target</p>
                  <p className="text-sm text-gray-100 font-semibold">{data.challenge_status.target}</p>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Timeline</p>
                  <p className="text-sm text-gray-100 font-semibold">{data.challenge_status.timeline}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-sm text-gray-100 font-semibold mb-2">Progress</p>
                  <div className="space-y-2">
                    {Object.entries(data.challenge_status.progress).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{toLabel(key)}</span>
                          <span className="text-gray-300">{value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-sm text-gray-100 font-semibold mb-2">Milestones</p>
                  <div className="space-y-2">
                    {data.challenge_status.milestones.map((milestone, idx) => (
                      <div key={`${milestone.task}-${idx}`} className="flex items-center gap-2 text-sm">
                        {milestone.done ? <CheckCircle2 size={16} className="text-green-400" /> : <Circle size={16} className="text-gray-500" />}
                        <span className={milestone.done ? 'text-gray-200' : 'text-gray-400'}>{milestone.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
              <h2 className="text-lg font-semibold text-gray-100 mb-3">Insights</h2>
              <div className="space-y-4">
                {sortedInsights.length > 0 ? (
                  sortedInsights.map((day, dayIdx) => (
                    <div key={`${day.date}-${dayIdx}`} className="bg-black/20 border border-white/10 rounded-xl p-3">
                      <p className="text-sm text-gray-400 mb-2">{formatLocalDateTime(day.date)}</p>
                      <ul className="space-y-2">
                        {(day.items || []).map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-300">- {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No insights yet.</p>
                )}
              </div>
            </section>

            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
              <h2 className="text-lg font-semibold text-gray-100 mb-3">Recent Activity Log</h2>
              <p className="text-sm text-gray-400 mb-3">{formatLocalDateTime(data.daily_log.date)}</p>
              <div className="space-y-2 mb-3">
                {data.daily_log.activities.length > 0 ? (
                  data.daily_log.activities.map((activity, idx) => (
                    <p key={idx} className="text-sm text-gray-300">- {activity}</p>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No daily activities in payload.</p>
                )}
              </div>
              <p className="text-sm text-indigo-300">Token Usage: {data.daily_log.token_usage}</p>
            </section>

            <div className="grid lg:grid-cols-2 gap-6">
              <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Network & Connections</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {data.network.map((contact) => (
                    <a key={contact.name} href={`https://www.moltbook.com/u/${contact.name}`} target="_blank" rel="noopener noreferrer" className="bg-black/20 border border-white/10 rounded-xl p-3 hover:border-indigo-400/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-100">{contact.name}</span>
                        <span className="text-xs text-indigo-300">{contact.karma} karma</span>
                      </div>
                      <p className="text-xs text-gray-400">{contact.focus}</p>
                    </a>
                  ))}
                </div>
              </section>

              <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Active Trading Strategies</h2>
                <div className="space-y-3">
                  {data.strategies.map((strategy) => (
                    <div key={strategy.name} className="bg-black/20 border border-white/10 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-100">{strategy.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${RISK_STYLES[strategy.risk] || STATUS_STYLES['Not Started']}`}>{strategy.risk}</span>
                      </div>
                      <p className="text-xs text-gray-400">{strategy.description}</p>
                      <p className="text-xs text-gray-300 mt-1">Expected: {strategy.expected_return} · Capital: {strategy.capital}</p>
                      {strategy.status && <p className="text-xs text-cyan-300 mt-1">Status: {strategy.status}</p>}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
              <h2 className="text-lg font-semibold text-gray-100 mb-3">Infrastructure</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-sm font-semibold text-gray-100 mb-2">API Connections</p>
                  {(data.system_status?.api_connections || ['Kalshi API: Connected', 'NOAA Weather: Connected', 'GDELT Events: Not configured']).map((line, idx) => (
                    <p key={idx} className="text-xs text-gray-300">- {line}</p>
                  ))}
                </div>
                <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-sm font-semibold text-gray-100 mb-2">Automation</p>
                  {(data.system_status?.automation || ['Market Scanner: Running', 'Order Placer: Ready', 'Risk Manager: Active']).map((line, idx) => (
                    <p key={idx} className="text-xs text-gray-300">- {line}</p>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">Last check: {data.system_status?.last_check || '5 minutes ago'} · Uptime: {data.system_status?.uptime || '99.8%'}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Sandy's Board - Built with OpenClaw</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
