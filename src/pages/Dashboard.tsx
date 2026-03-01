import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';

type StatusOverview = {
  capital: string;
  phase: string;
  status: string;
  pnl_today: string;
  pnl_total: string;
};

type CurrentPlaybook = {
  strategy_name: string;
  description: string;
  edge_source: string;
  platform: string;
  cities: string;
  entry_rule: string;
  position_sizing: string;
  risk_limits: {
    max_bet: string;
    max_concurrent: number;
    daily_loss_limit: string;
  };
  current_goal: string;
  next_phase: string;
};

type TradingStats = {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: string;
  avg_win: string;
  avg_loss: string;
  testing_progress: string;
  testing_budget_used: string;
};

type OpenPosition = {
  market: string;
  side: string;
  entry_price: string;
  amount: string;
  edge: string;
  status: string;
};

type OpenPositions = {
  positions: OpenPosition[];
  portfolio_heat: string;
};

type MoltbookStats = {
  karma: number;
  followers: number;
  posts: number;
  comments: number;
  profile_url: string;
};

type RoadmapPhase = {
  name: string;
  timeline: string;
  target: string;
  status?: string;
  goal?: string;
};

type Roadmap = {
  current_phase: RoadmapPhase;
  next_phases: RoadmapPhase[];
};

type RecentActivityDay = {
  date: string;
  activities: string[];
};

type DashboardData = {
  last_updated: string;
  status_overview: StatusOverview;
  current_playbook: CurrentPlaybook;
  trading_stats: TradingStats;
  open_positions: OpenPositions;
  moltbook: MoltbookStats;
  roadmap: Roadmap;
  recent_activity: {
    daily_log: RecentActivityDay[];
  };
};

const DATA_PATH = '/data/andy-updates.json';
const REFRESH_MS = 60_000;

function formatLastUpdated(raw: string): string {
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})([+-]\d{2})(\d{2})$/);
  if (!m) return raw || '-';
  const [, d, t, oh, om] = m;
  return `${d} ${t} UTC${oh}:${om}`;
}

function toLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function normalizeData(raw: any): DashboardData {
  const challenge = raw?.challenge_status || {};
  const progress = challenge?.progress || {};

  const wins = parseNumber(progress?.wins, 0);
  const losses = parseNumber(progress?.losses, 0);
  const total = wins + losses;
  const computedWinRate = total > 0 ? `${Math.round((wins / total) * 100)}%` : '0%';

  const statusOverview: StatusOverview = {
    capital: String(raw?.status_overview?.capital || raw?.hero?.current_capital || '$5,000.00'),
    phase: String(raw?.status_overview?.phase || raw?.hero?.current_phase || challenge?.phase || 'Testing ($1 max bets)'),
    status: String(raw?.status_overview?.status || raw?.hero?.status || '🟡 TESTING MODE'),
    pnl_today: String(raw?.status_overview?.pnl_today || raw?.hero?.pnl_today || '+$0.00 (0%)'),
    pnl_total: String(raw?.status_overview?.pnl_total || raw?.hero?.all_time_pnl || '+$0.00 (0%)'),
  };

  const playbook: CurrentPlaybook = {
    strategy_name: String(raw?.current_playbook?.strategy_name || raw?.active_playbook?.title || 'Weather Arbitrage (NOAA Edge)'),
    description: String(raw?.current_playbook?.description || 'Use NOAA forecast data (85-90% accurate) vs Kalshi market prices'),
    edge_source: String(raw?.current_playbook?.edge_source || 'NOAA weather forecasts'),
    platform: String(raw?.current_playbook?.platform || 'Kalshi'),
    cities: String(raw?.current_playbook?.cities || 'NYC, Chicago, Miami, LA, Denver, Philadelphia'),
    entry_rule: String(raw?.current_playbook?.entry_rule || 'Min 5% edge (NOAA confidence vs market price)'),
    position_sizing: String(raw?.current_playbook?.position_sizing || 'Kelly Criterion (capped at $1 during testing)'),
    risk_limits: {
      max_bet: String(raw?.current_playbook?.risk_limits?.max_bet || '$1'),
      max_concurrent: parseNumber(raw?.current_playbook?.risk_limits?.max_concurrent, 3),
      daily_loss_limit: String(raw?.current_playbook?.risk_limits?.daily_loss_limit || '-4% ($200)'),
    },
    current_goal: String(raw?.current_playbook?.current_goal || 'Test 50 trades to prove profitability'),
    next_phase: String(raw?.current_playbook?.next_phase || 'If successful: Scale to $10-20 bets, target $1k-> $10k'),
  };

  const tradingStats: TradingStats = {
    total_trades: parseNumber(raw?.trading_stats?.total_trades, total),
    wins: parseNumber(raw?.trading_stats?.wins, wins),
    losses: parseNumber(raw?.trading_stats?.losses, losses),
    win_rate: String(raw?.trading_stats?.win_rate || computedWinRate),
    avg_win: String(raw?.trading_stats?.avg_win || '$0.00'),
    avg_loss: String(raw?.trading_stats?.avg_loss || '$0.00'),
    testing_progress: String(raw?.trading_stats?.testing_progress || '0/50 trades'),
    testing_budget_used: String(raw?.trading_stats?.testing_budget_used || '$0/$50'),
  };

  const mappedPositions = Array.isArray(raw?.open_positions?.positions)
    ? raw.open_positions.positions
    : Array.isArray(raw?.trading_performance?.current_trades)
      ? raw.trading_performance.current_trades.map((p: any) => ({
          market: String(p.market || p.Market || '-'),
          side: String(p.side || p.Side || '-'),
          entry_price: String(p.entry_price || p.entry || p.Entry || '-'),
          amount: String(p.amount || '$1.00'),
          edge: String(p.edge || p.Edge || '-'),
          status: String(p.status || 'Open'),
        }))
      : [];

  const openPositions: OpenPositions = {
    positions: mappedPositions,
    portfolio_heat: String(raw?.open_positions?.portfolio_heat || '$0 / $3 max'),
  };

  const moltbook: MoltbookStats = {
    karma: parseNumber(raw?.moltbook?.karma, 0),
    followers: parseNumber(raw?.moltbook?.followers, 0),
    posts: parseNumber(raw?.moltbook?.posts ?? raw?.moltbook?.total_posts, 0),
    comments: parseNumber(raw?.moltbook?.comments ?? raw?.moltbook?.total_comments, 0),
    profile_url: String(raw?.moltbook?.profile_url || '#'),
  };

  const roadmap: Roadmap = {
    current_phase: {
      name: String(raw?.roadmap?.current_phase?.name || challenge?.phase || 'Testing'),
      status: String(raw?.roadmap?.current_phase?.status || 'active'),
      goal: String(raw?.roadmap?.current_phase?.goal || 'Prove strategy works with $1 bets'),
      timeline: String(raw?.roadmap?.current_phase?.timeline || challenge?.timeline || '1-2 weeks'),
      target: String(raw?.roadmap?.current_phase?.target || challenge?.target || '$1k -> $10k'),
    },
    next_phases: Array.isArray(raw?.roadmap?.next_phases)
      ? raw.roadmap.next_phases.map((p: any) => ({
          name: String(p.name || '-'),
          timeline: String(p.timeline || '-'),
          target: String(p.target || '-'),
        }))
      : [
          { name: 'Phase 1: $1k -> $10k', timeline: '4-6 weeks', target: '3-5% daily' },
          { name: 'Phase 2: $10k -> $100k', timeline: '6-8 weeks', target: '2.74% daily' },
          { name: 'Phase 3: $100k -> $1M', timeline: '8-12 weeks', target: '2.5% daily' },
        ],
  };

  const dailyLog = Array.isArray(raw?.recent_activity?.daily_log)
    ? raw.recent_activity.daily_log
    : Array.isArray(raw?.daily_log)
      ? raw.daily_log
      : raw?.daily_log?.activities
        ? [{ date: String(raw?.daily_log?.date || ''), activities: raw.daily_log.activities }]
        : [];

  return {
    last_updated: String(raw?.last_updated || ''),
    status_overview: statusOverview,
    current_playbook: playbook,
    trading_stats: tradingStats,
    open_positions: openPositions,
    moltbook,
    roadmap,
    recent_activity: {
      daily_log: dailyLog.map((d: any) => ({
        date: String(d?.date || ''),
        activities: Array.isArray(d?.activities) ? d.activities.map(String) : [],
      })),
    },
  };
}

const card = 'bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5';

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUpdates = async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${DATA_PATH}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const json = await response.json();
      setData(normalizeData(json));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

  const latestLog = useMemo(() => data?.recent_activity?.daily_log?.[0], [data]);

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

        <div className={`space-y-6 transition-opacity ${isRefreshing ? 'opacity-80' : 'opacity-100'}`}>
          <section className={`${card} flex flex-col md:flex-row md:items-center md:justify-between gap-3`}>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-1">Sandy's Trading Dashboard</h1>
              <p className="text-sm text-gray-400">Last Updated: <span className="text-gray-200">{formatLastUpdated(data?.last_updated || '')}</span></p>
            </div>
            <RefreshCw size={14} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </section>

          {loading && (
            <div className="space-y-4 animate-pulse">
              {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl" />)}
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-200">
              Could not load dashboard data from <code>{DATA_PATH}</code>. Error: {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              <section className={card}>
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Status Overview</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    ['Capital', data.status_overview.capital],
                    ['Phase', data.status_overview.phase],
                    ['Status', data.status_overview.status],
                    ['P&L Today', data.status_overview.pnl_today],
                    ['P&L Total', data.status_overview.pnl_total],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-black/20 border border-white/10 rounded-xl p-3">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-100 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={card}>
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Current Playbook</h2>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {[
                    ['Strategy', data.current_playbook.strategy_name],
                    ['Description', data.current_playbook.description],
                    ['Edge Source', data.current_playbook.edge_source],
                    ['Platform', data.current_playbook.platform],
                    ['Cities', data.current_playbook.cities],
                    ['Entry Rule', data.current_playbook.entry_rule],
                    ['Position Sizing', data.current_playbook.position_sizing],
                    ['Current Goal', data.current_playbook.current_goal],
                    ['Next Phase', data.current_playbook.next_phase],
                  ].map(([k, v]) => (
                    <div key={k as string} className="bg-black/20 border border-white/10 rounded-xl p-3">
                      <p className="text-xs text-gray-400">{k}</p>
                      <p className="text-sm text-gray-100 mt-1">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-black/20 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Risk Limits</p>
                  <p className="text-sm text-gray-100">Max bet: {data.current_playbook.risk_limits.max_bet} · Max concurrent: {data.current_playbook.risk_limits.max_concurrent} · Daily loss limit: {data.current_playbook.risk_limits.daily_loss_limit}</p>
                </div>
              </section>

              <div className="grid lg:grid-cols-2 gap-6">
                <section className={card}>
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Trading Stats</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Total Trades', data.trading_stats.total_trades],
                      ['Wins', data.trading_stats.wins],
                      ['Losses', data.trading_stats.losses],
                      ['Win Rate', data.trading_stats.win_rate],
                      ['Avg Win', data.trading_stats.avg_win],
                      ['Avg Loss', data.trading_stats.avg_loss],
                      ['Testing Progress', data.trading_stats.testing_progress],
                      ['Budget Used', data.trading_stats.testing_budget_used],
                    ].map(([k, v]) => (
                      <div key={k as string} className="bg-black/20 border border-white/10 rounded-xl p-3">
                        <p className="text-xs text-gray-400">{k}</p>
                        <p className="text-sm text-gray-100 mt-1">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={card}>
                  <h2 className="text-lg font-semibold text-gray-100 mb-3">Open Positions</h2>
                  <p className="text-xs text-gray-400 mb-2">Portfolio Heat: <span className="text-gray-200">{data.open_positions.portfolio_heat}</span></p>
                  <div className="space-y-2">
                    {(data.open_positions.positions.length > 0 ? data.open_positions.positions : [{ market: 'No open positions', side: '-', entry_price: '-', amount: '-', edge: '-', status: '-' }]).map((p, i) => (
                      <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-3 text-xs grid grid-cols-6 gap-2">
                        <span className="col-span-2 text-gray-200">{p.market}</span>
                        <span className="text-gray-300">{p.side}</span>
                        <span className="text-gray-300">{p.entry_price}</span>
                        <span className="text-cyan-300">{p.edge}</span>
                        <span className="text-gray-300">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className={card}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-100">Moltbook</h2>
                  <a href={data.moltbook.profile_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-indigo-200">Profile <ExternalLink size={14} /></a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ['Karma', data.moltbook.karma],
                    ['Followers', data.moltbook.followers],
                    ['Posts', data.moltbook.posts],
                    ['Comments', data.moltbook.comments],
                  ].map(([k, v]) => (
                    <div key={k as string} className="bg-black/20 border border-white/10 rounded-xl p-3">
                      <p className="text-xs text-gray-400">{k}</p>
                      <p className="text-xl font-bold text-gray-100 mt-1">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={card}>
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Roadmap</h2>
                <div className="bg-black/20 border border-white/10 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-400">Current Phase</p>
                  <p className="text-sm text-gray-100 mt-1">{data.roadmap.current_phase.name} · {data.roadmap.current_phase.timeline}</p>
                  <p className="text-xs text-gray-300 mt-1">{data.roadmap.current_phase.goal || '-'}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {data.roadmap.next_phases.map((p, i) => (
                    <div key={i} className="bg-black/20 border border-white/10 rounded-xl p-3">
                      <p className="text-sm text-gray-100 font-semibold">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.timeline}</p>
                      <p className="text-xs text-cyan-300 mt-1">{p.target}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={card}>
                <h2 className="text-lg font-semibold text-gray-100 mb-3">Recent Activity</h2>
                {latestLog ? (
                  <>
                    <p className="text-sm text-gray-400 mb-2">{latestLog.date}</p>
                    <div className="space-y-2">
                      {latestLog.activities.map((a, i) => (
                        <p key={i} className="text-sm text-gray-300">- {a}</p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity entries.</p>
                )}
              </section>
            </>
          )}
        </div>

        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Sandy's Board - Built with OpenClaw</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
