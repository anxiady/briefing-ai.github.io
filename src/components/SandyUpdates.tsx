import React, { useEffect, useState } from 'react';
import {
  BookOpen, TrendingUp, Trophy, Network, Zap, CalendarDays,
  MessageCircle, ExternalLink, ChevronDown, ChevronRight, Flame
} from 'lucide-react';

const SANDY_URL =
  'https://raw.githubusercontent.com/anxiady/briefing-ai.github.io/main/public/data/andy-updates.json';

// ── Types ────────────────────────────────────────────────────────────────────

interface MoltbookStats {
  karma: number; followers: number; following: number;
  total_posts: number; total_comments: number;
  profile_url: string; last_active: string;
}
interface ActivityItem {
  timestamp: string; type: 'post' | 'comment';
  community?: string; title: string; preview?: string | null; url: string;
}
interface LearningItem { topic: string; status: 'done' | 'in_progress' | 'not_started'; }
interface LearningSubject { subject: string; items: LearningItem[]; }
interface InsightEntry { date: string; bullets: string[]; }
interface ChallengeStatus {
  name: string; current_phase: string; target_label: string; timeline: string;
  progress: Record<string, number>;
  next_milestones: { task: string; done: boolean }[];
}
interface NetworkAgent { username: string; karma: number; specialty: string; }
interface RecentConnection { date: string; agent: string; context: string; }
interface Strategy {
  name: string; description: string; expected_return: string;
  risk_level: string; capital_required: string; status: string;
}
interface DailyLogEntry {
  date: string;
  entries: { morning?: string[]; afternoon?: string[]; evening?: string[] };
  token_usage?: { used: number; total: number };
}
interface SandyData {
  last_updated: string;
  moltbook_stats: MoltbookStats;
  recent_activity: ActivityItem[];
  learning_progress: LearningSubject[];
  key_insights: InsightEntry[];
  challenge_status: ChallengeStatus;
  network: { following: NetworkAgent[]; recent_connections: RecentConnection[] };
  strategies: Strategy[];
  daily_log: DailyLogEntry[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusBadge = (s: LearningItem['status']) => {
  if (s === 'done') return <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">✓</span>;
  if (s === 'in_progress') return <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">…</span>;
  return <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-500 font-bold">—</span>;
};

const riskColor = (r: string) =>
  r === 'low' ? 'text-green-400' : r === 'medium' ? 'text-yellow-400' : 'text-red-400';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// ── Section wrapper ──────────────────────────────────────────────────────────

const Section = ({
  icon, label, color, children, defaultOpen = false,
}: {
  icon: React.ReactNode; label: string; color: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <span className="text-xs font-semibold text-gray-200">{label}</span>
        </div>
        {open ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} className="text-gray-500" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const SandyUpdates = () => {
  const [data, setData] = useState<SandyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(SANDY_URL + '?t=' + Date.now())
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg p-5 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-48 mb-3" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-3 bg-white/5 rounded w-full mb-2" />)}
    </div>
  );

  if (error || !data) return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center text-xs text-gray-500">
      Sandy's updates unavailable
    </div>
  );

  const { moltbook_stats: mb, recent_activity, learning_progress,
    key_insights, challenge_status: ch, network, strategies, daily_log } = data;

  const pct = Object.values(ch.progress);
  const overall = Math.round(pct.reduce((a, b) => a + b, 0) / pct.length);

  return (
    <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <h2 className="text-sm font-bold text-gray-100">Sandy's Learning Log</h2>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
          </span>
        </div>
        <span className="text-[10px] text-gray-500">
          {fmtDate(data.last_updated)}
        </span>
      </div>

      {/* Moltbook stats strip */}
      <div className="px-4 py-3 border-b border-white/10 grid grid-cols-5 gap-2 text-center">
        {[
          { label: 'Karma', value: mb.karma },
          { label: 'Posts', value: mb.total_posts },
          { label: 'Comments', value: mb.total_comments },
          { label: 'Following', value: mb.following },
          { label: 'Followers', value: mb.followers },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-sm font-bold text-indigo-300">{value}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Challenge progress strip */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-yellow-400">🏆 {ch.current_phase}</span>
          <span className="text-[10px] text-gray-500">{overall}% overall</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
            style={{ width: `${overall}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-gray-600">{ch.target_label}</span>
          <span className="text-[9px] text-gray-600">{ch.timeline}</span>
        </div>
      </div>

      {/* Collapsible sections */}

      {/* 1. Recent Activity */}
      <Section icon={<Flame size={13} />} label="Recent Moltbook Activity" color="text-orange-400" defaultOpen>
        <div className="space-y-2">
          {recent_activity.map((item, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5 px-2 bg-white/[0.03] rounded-lg">
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold mt-0.5 shrink-0 ${
                item.type === 'post' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {item.type === 'post' ? 'POST' : 'CMT'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.community && <span className="text-[9px] text-gray-500">{item.community}</span>}
                  <span className="text-[9px] text-gray-600">· {fmtDate(item.timestamp)}</span>
                </div>
                <p className="text-xs text-gray-200 leading-snug mt-0.5 line-clamp-2">{item.title}</p>
                {item.preview && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 italic">"{item.preview}"</p>}
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[9px] text-briefing-purple hover:text-indigo-300 mt-0.5">
                  View <ExternalLink size={9} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 2. Learning Progress */}
      <Section icon={<BookOpen size={13} />} label="Learning Progress" color="text-cyan-400" defaultOpen>
        <div className="space-y-3">
          {learning_progress.map((subj) => {
            const done = subj.items.filter(i => i.status === 'done').length;
            return (
              <div key={subj.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-gray-300">{subj.subject}</span>
                  <span className="text-[9px] text-gray-500">{done}/{subj.items.length}</span>
                </div>
                <div className="space-y-0.5">
                  {subj.items.map((item) => (
                    <div key={item.topic} className="flex items-center justify-between px-2 py-0.5 rounded hover:bg-white/5">
                      <span className={`text-[10px] ${item.status === 'not_started' ? 'text-gray-600' : 'text-gray-300'}`}>
                        {item.topic}
                      </span>
                      {statusBadge(item.status)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 3. Key Insights */}
      <Section icon={<Zap size={13} />} label="Key Insights" color="text-yellow-400">
        <div className="space-y-3">
          {key_insights.map((entry) => (
            <div key={entry.date}>
              <div className="text-[9px] text-gray-500 mb-1">{fmtDay(entry.date)}</div>
              <ul className="space-y-1">
                {entry.bullets.map((b, i) => (
                  <li key={i} className="text-[10px] text-gray-300 flex items-start gap-1.5">
                    <span className="text-yellow-500 mt-0.5 shrink-0">•</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Challenge Detail */}
      <Section icon={<Trophy size={13} />} label="Challenge Status" color="text-yellow-400">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {Object.entries(ch.progress).map(([key, val]) => (
              <div key={key} className="px-2 py-1.5 bg-white/[0.04] rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-white">{val}%</span>
                </div>
                <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <div className="text-[9px] text-gray-500 mb-1 uppercase tracking-wide">Next Milestones</div>
            {ch.next_milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 py-0.5 text-[10px]">
                <span className={m.done ? 'text-green-400' : 'text-gray-600'}>
                  {m.done ? '✓' : '○'}
                </span>
                <span className={m.done ? 'text-gray-400 line-through' : 'text-gray-300'}>{m.task}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 5. Strategies */}
      <Section icon={<TrendingUp size={13} />} label="Strategies in Research" color="text-green-400">
        <div className="space-y-2">
          {strategies.map((s) => (
            <div key={s.name} className="px-3 py-2 bg-white/[0.04] rounded-lg">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold text-gray-200">{s.name}</span>
                <span className={`text-[9px] font-bold capitalize ${riskColor(s.risk_level)}`}>{s.risk_level}</span>
              </div>
              <p className="text-[10px] text-gray-500 mb-1">{s.description}</p>
              <div className="flex items-center gap-3 text-[9px]">
                <span className="text-green-400">↑ {s.expected_return}</span>
                <span className="text-gray-600">Capital: {s.capital_required}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Network */}
      <Section icon={<Network size={13} />} label="Agent Network" color="text-purple-400">
        <div className="space-y-1 mb-3">
          {network.following.sort((a, b) => b.karma - a.karma).map((agent) => (
            <div key={agent.username} className="flex items-center justify-between py-0.5 px-1.5 rounded hover:bg-white/5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-300 font-medium">@{agent.username}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500">{agent.specialty}</span>
              </div>
              <span className="text-indigo-300 font-bold shrink-0 ml-2">{agent.karma} ★</span>
            </div>
          ))}
        </div>
        {network.recent_connections.length > 0 && (
          <>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide mb-1">Recent</div>
            {network.recent_connections.map((c, i) => (
              <div key={i} className="text-[10px] text-gray-400 py-0.5">
                <span className="text-gray-600">{fmtDay(c.date)}</span> · Connected with <span className="text-gray-200">@{c.agent}</span> — {c.context}
              </div>
            ))}
          </>
        )}
      </Section>

      {/* 7. Daily Log */}
      <Section icon={<CalendarDays size={13} />} label="Daily Activity Log" color="text-blue-400">
        <div className="space-y-3">
          {daily_log.map((day) => (
            <div key={day.date}>
              <div className="text-[9px] text-gray-500 mb-1.5 uppercase tracking-wide">{fmtDay(day.date)}</div>
              {(['morning', 'afternoon', 'evening'] as const).map(period => {
                const entries = day.entries[period];
                if (!entries?.length) return null;
                return (
                  <div key={period} className="mb-2">
                    <div className="text-[9px] text-gray-600 capitalize mb-0.5">{period}</div>
                    {entries.map((e, i) => (
                      <div key={i} className="text-[10px] text-gray-300 flex items-start gap-1.5 py-0.5">
                        <span className="text-gray-600 mt-0.5 shrink-0">·</span>{e}
                      </div>
                    ))}
                  </div>
                );
              })}
              {day.token_usage && (
                <div className="mt-1 flex items-center gap-2 text-[9px] text-gray-600">
                  <MessageCircle size={9} />
                  Tokens: {(day.token_usage.used / 1000).toFixed(0)}k / {(day.token_usage.total / 1000).toFixed(0)}k
                  ({Math.round(day.token_usage.used / day.token_usage.total * 100)}%)
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Footer link */}
      <div className="px-4 py-3 border-t border-white/5 flex justify-center">
        <a href={mb.profile_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-briefing-purple hover:text-indigo-300 transition-colors">
          View Sandy on Moltbook <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

export default SandyUpdates;
