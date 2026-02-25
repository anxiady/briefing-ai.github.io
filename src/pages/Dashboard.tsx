import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Circle,
  ChevronDown,
} from 'lucide-react';
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
}

const DATA_PATH = '/data/andy-updates.json';
const REFRESH_MS = 60_000;

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
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return value.toLocaleString();
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
      const json = (await response.json()) as AndyUpdatesData;
      setData(json);
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

  const latestInsights = useMemo(() => {
    if (!data?.insights?.length) return null;
    return [...data.insights].sort((a, b) => b.date.localeCompare(a.date))[0];
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

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-2xl" />
      ))}
    </div>
  );

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
            Sandy's Board
          </div>
        </div>

        <div
          className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-85' : 'opacity-100'}`}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  style={{
                    background: 'linear-gradient(to right, #E0E7FF, #818CF8)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Andy&apos;s AI Trading Journey
                </h1>
                <p className="text-gray-300">$1,000 -&gt; $1,000,000 Challenge</p>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                Last Updated:
                <span className="text-gray-200 font-medium">
                  {data?.last_updated || '-'}
                </span>
              </div>
            </div>
          </div>

          {loading && renderSkeleton()}

          {!loading && error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-200">
              Could not load dashboard data from <code>{DATA_PATH}</code>. Error: {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className="space-y-6">
                <div className="grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-6">
                    {/* 2. Moltbook Activity Stats */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-100">Moltbook Activity Stats</h2>
                        <a
                          href={data.moltbook.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-indigo-300 hover:text-indigo-200"
                        >
                          Profile <ExternalLink size={14} />
                        </a>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          ['Karma', data.moltbook.karma],
                          ['Followers', data.moltbook.followers],
                          ['Following', data.moltbook.following],
                          ['Posts', data.moltbook.posts],
                          ['Comments', data.moltbook.comments],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-black/20 border border-white/10 rounded-xl p-3">
                            <p className="text-xs text-gray-400">{label}</p>
                            <p className="text-xl font-bold text-gray-100 mt-1">{value}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 3. Recent Moltbook Activity */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                      <h2 className="text-lg font-semibold text-gray-100 mb-4">Recent Moltbook Activity</h2>
                      <div className="grid md:grid-cols-2 gap-3">
                        {data.moltbook.recent_activity.slice(0, 10).map((item, idx) => (
                          <a
                            key={`${item.url}-${idx}`}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-black/20 border border-white/10 rounded-xl p-4 hover:border-indigo-400/40 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border ${
                                  item.type === 'post'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/20'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-400/20'
                                }`}
                              >
                                {item.type === 'post' ? 'Post' : 'Comment'}
                              </span>
                              <span className="text-xs text-gray-500">{toRelativeTime(item.timestamp)}</span>
                            </div>
                            <p className="text-sm text-gray-100 font-medium">
                              {item.title || item.preview || 'Activity update'}
                            </p>
                            {item.post_title && <p className="text-xs text-gray-400 mt-1">On: {item.post_title}</p>}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                              {item.submolt && <span>Submolt: {item.submolt}</span>}
                              {typeof item.upvotes === 'number' && <span>Upvotes: {item.upvotes}</span>}
                              <span>{formatLocalDateTime(item.timestamp)}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </section>

                    {/* 6. Latest Insights */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                      <h2 className="text-lg font-semibold text-gray-100 mb-2">Latest Insights</h2>
                      <p className="text-sm text-gray-400 mb-3">
                        {latestInsights ? formatLocalDateTime(latestInsights.date) : 'No insights yet'}
                      </p>
                      <ul className="space-y-2">
                        {(latestInsights?.items || []).map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-300">
                            - {item}
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* 9. Daily Activity Log */}
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer list-none">
                          <div>
                            <h2 className="text-lg font-semibold text-gray-100">Daily Activity Log</h2>
                            <p className="text-sm text-gray-400">{formatLocalDateTime(data.daily_log.date)}</p>
                          </div>
                          <ChevronDown className="text-gray-400 transition-transform group-open:rotate-180" size={18} />
                        </summary>
                        <div className="mt-4 space-y-2">
                          {data.daily_log.activities.map((activity, idx) => (
                            <p key={idx} className="text-sm text-gray-300">
                              - {activity}
                            </p>
                          ))}
                          <p className="text-sm text-indigo-300 mt-3">
                            Token Usage: {data.daily_log.token_usage}
                          </p>
                        </div>
                      </details>
                    </section>
                  </div>

                  {/* 4. Learning Progress */}
                  <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 lg:col-span-5">
                    <h2 className="text-lg font-semibold text-gray-100 mb-4">Learning Progress</h2>
                    <div className="grid gap-4">
                      {Object.entries(data.learning_progress).map(([category, itemMap]) => {
                        const progress = sectionProgress(itemMap);
                        return (
                          <div key={category} className="bg-black/20 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-semibold text-gray-100">{toLabel(category)}</h3>
                              <span className="text-xs text-gray-400">{progress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="space-y-2">
                              {Object.entries(itemMap).map(([name, status]) => (
                                <div key={name} className="flex items-center justify-between gap-2">
                                  <span className="text-sm text-gray-300">{toLabel(name)}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[status]}`}>{status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* 5. Challenge Status */}
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-4">$1k -&gt; $1M Challenge Status</h2>
                  <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400">Current Phase</p>
                    <p className="text-base text-gray-100 font-semibold mb-3">{data.challenge_status.phase}</p>
                    <p className="text-sm text-gray-400">Target</p>
                    <p className="text-base text-gray-100 font-semibold mb-3">{data.challenge_status.target}</p>
                    <p className="text-sm text-gray-400">Timeline</p>
                    <p className="text-base text-gray-100 font-semibold">{data.challenge_status.timeline}</p>
                  </div>
                  <div className="mt-4 bg-black/20 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-100 font-semibold mb-3">Progress</p>
                    <div className="space-y-3">
                      {Object.entries(data.challenge_status.progress).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{toLabel(key)}</span>
                            <span className="text-gray-300">{value}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 bg-black/20 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-100 font-semibold mb-2">Milestones</p>
                    <div className="space-y-2">
                      {data.challenge_status.milestones.map((milestone, idx) => (
                        <div key={`${milestone.task}-${idx}`} className="flex items-center gap-2 text-sm">
                          {milestone.done ? (
                            <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                          ) : (
                            <Circle size={16} className="text-gray-500 shrink-0" />
                          )}
                          <span className={milestone.done ? 'text-gray-200' : 'text-gray-400'}>{milestone.task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 7. Network & Connections */}
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-4">Network &amp; Connections</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {data.network.map((contact) => (
                      <a
                        key={contact.name}
                        href={`https://www.moltbook.com/u/${contact.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black/20 border border-white/10 rounded-xl p-4 hover:border-indigo-400/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-100">{contact.name}</span>
                          <span className="text-xs text-indigo-300">{contact.karma} karma</span>
                        </div>
                        <p className="text-xs text-gray-400">{contact.focus}</p>
                      </a>
                    ))}
                  </div>
                </section>

                {/* 8. Active Trading Strategies */}
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                  <h2 className="text-lg font-semibold text-gray-100 mb-4">Active Trading Strategies</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {data.strategies.map((strategy) => (
                      <div key={strategy.name} className="bg-black/20 border border-white/10 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-100">{strategy.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${RISK_STYLES[strategy.risk] || STATUS_STYLES['Not Started']}`}>
                            {strategy.risk}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{strategy.description}</p>
                        <p className="text-xs text-gray-300">Expected Return: {strategy.expected_return}</p>
                        <p className="text-xs text-gray-300">Capital: {strategy.capital}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>Sandy's Board - Built with OpenClaw</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
