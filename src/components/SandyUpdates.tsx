import React, { useEffect, useState } from 'react';
import {
  BookOpen, TrendingUp, Trophy, Network, Zap, CalendarDays,
  MessageCircle, ExternalLink, ChevronDown, ChevronRight, Flame, Satellite,
} from 'lucide-react';

const SANDY_URL =
  'https://raw.githubusercontent.com/anxiady/briefing-ai.github.io/main/public/sandy-updates.json';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusPip = (s: LearningItem['status']) => {
  if (s === 'done') return (
    <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-widest"
      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
      DONE
    </span>
  );
  if (s === 'in_progress') return (
    <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-widest"
      style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}>
      ACTIVE
    </span>
  );
  return (
    <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold tracking-widest"
      style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563', border: '1px solid rgba(255,255,255,0.06)' }}>
      QUEUED
    </span>
  );
};

const riskGlow = (r: string) =>
  r === 'low' ? '#34d399' : r === 'medium' ? '#facc15' : '#f87171';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// ── Glowline ──────────────────────────────────────────────────────────────────

const TealGlowLine = () => (
  <div className="absolute top-0 left-0 right-0 h-px" style={{
    background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.5), transparent)',
  }} />
);

// ── Section ───────────────────────────────────────────────────────────────────

const Section = ({
  icon, label, accent = '#2dd4bf', children, defaultOpen = false,
}: {
  icon: React.ReactNode; label: string; accent?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.04] last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
        style={{ background: open ? `rgba(${accent === '#2dd4bf' ? '45,212,191' : '255,255,255'},0.02)` : 'transparent' }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: accent }}>{icon}</span>
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: accent, opacity: 0.7 }}>{label}</span>
        </div>
        {open
          ? <ChevronDown size={11} className="text-gray-700" />
          : <ChevronRight size={11} className="text-gray-700" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

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
    <div className="relative overflow-hidden rounded-2xl p-6 animate-pulse" style={{
      background: 'linear-gradient(145deg, #020e0d 0%, #020c0b 100%)',
      border: '1px solid rgba(45,212,191,0.15)',
    }}>
      <div className="h-3 rounded w-40 mb-4" style={{ background: 'rgba(45,212,191,0.1)' }} />
      {[...Array(4)].map((_, i) => <div key={i} className="h-2.5 rounded w-full mb-2" style={{ background: 'rgba(45,212,191,0.05)' }} />)}
    </div>
  );

  if (error || !data) return (
    <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="text-[9px] font-mono text-gray-700 tracking-widest">SANDY TELEMETRY UNAVAILABLE</p>
    </div>
  );

  const { moltbook_stats: mb, recent_activity, learning_progress,
    key_insights, challenge_status: ch, network, strategies, daily_log } = data;

  const pct = Object.values(ch.progress);
  const overall = Math.round(pct.reduce((a, b) => a + b, 0) / pct.length);

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{
      background: 'linear-gradient(160deg, #020f0e 0%, #020c0b 60%, #020909 100%)',
      border: '1px solid rgba(45,212,191,0.18)',
      boxShadow: '0 0 50px rgba(45,212,191,0.06), 0 8px 40px rgba(0,0,0,0.6)',
    }}>
      <TealGlowLine />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(45,212,191,0.04) 0%, transparent 60%)',
      }} />

      {/* ── Header ── */}
      <div className="relative px-5 py-4 border-b border-teal-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Satellite size={14} className="text-teal-400" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-teal-400 uppercase">Mission Control</span>
          <span className="text-[9px] font-mono text-gray-700">// Sandy</span>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
          </span>
        </div>
        <span className="text-[9px] font-mono text-gray-700">{fmtDate(data.last_updated)}</span>
      </div>

      {/* ── Telemetry strip ── */}
      <div className="relative px-5 py-4 border-b border-teal-500/8">
        <div className="text-[8px] font-mono tracking-[0.3em] text-gray-700 uppercase mb-3">Telemetry</div>
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { label: 'Karma', value: mb.karma },
            { label: 'Posts', value: mb.total_posts },
            { label: 'Cmts', value: mb.total_comments },
            { label: 'Following', value: mb.following },
            { label: 'Followers', value: mb.followers },
          ].map(({ label, value }) => (
            <div key={label} className="py-2 px-1 rounded-lg" style={{
              background: 'rgba(45,212,191,0.04)',
              border: '1px solid rgba(45,212,191,0.08)',
            }}>
              <div className="text-sm font-bold font-mono" style={{ color: '#5eead4' }}>{value}</div>
              <div className="text-[8px] font-mono text-gray-700 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission trajectory ── */}
      <div className="relative px-5 py-4 border-b border-teal-500/8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[8px] font-mono tracking-[0.3em] text-gray-700 uppercase">Mission Trajectory</div>
            <div className="text-[10px] font-mono text-teal-300/70 mt-0.5">{ch.current_phase}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono" style={{ color: '#5eead4' }}>{overall}%</div>
            <div className="text-[8px] font-mono text-gray-700">{ch.timeline}</div>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(45,212,191,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{
            width: `${overall}%`,
            background: 'linear-gradient(90deg, #0d9488, #2dd4bf)',
            boxShadow: '0 0 8px rgba(45,212,191,0.4)',
          }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-mono text-gray-800">$1k</span>
          <span className="text-[8px] font-mono text-gray-800">$1M</span>
        </div>
      </div>

      {/* ── Collapsible sections ── */}

      {/* Recent Activity */}
      <Section icon={<Flame size={12} />} label="Recent Activity" defaultOpen>
        <div className="space-y-2">
          {recent_activity.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{
              background: 'rgba(45,212,191,0.03)',
              border: '1px solid rgba(45,212,191,0.08)',
            }}>
              <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold mt-0.5 shrink-0 tracking-widest" style={
                item.type === 'post'
                  ? { background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }
                  : { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }
              }>
                {item.type === 'post' ? 'POST' : 'CMT'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-mono text-gray-700 mb-0.5">
                  {item.community && <span className="text-teal-700/60">{item.community} · </span>}
                  {fmtDate(item.timestamp)}
                </div>
                <p className="text-xs text-gray-300 leading-snug line-clamp-2">{item.title}</p>
                {item.preview && <p className="text-[9px] text-gray-600 mt-0.5 italic line-clamp-1">"{item.preview}"</p>}
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[8px] font-mono text-teal-600 hover:text-teal-400 mt-1 tracking-widest">
                  VIEW <ExternalLink size={8} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Learning Progress */}
      <Section icon={<BookOpen size={12} />} label="Learning Progress" defaultOpen>
        <div className="space-y-4">
          {learning_progress.map(subj => {
            const done = subj.items.filter(i => i.status === 'done').length;
            const pct = Math.round((done / subj.items.length) * 100);
            return (
              <div key={subj.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-gray-400">{subj.subject}</span>
                  <span className="text-[8px] font-mono text-teal-700">{done}/{subj.items.length}</span>
                </div>
                <div className="w-full h-0.5 rounded-full mb-2" style={{ background: 'rgba(45,212,191,0.08)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #0d9488, #2dd4bf)',
                  }} />
                </div>
                <div className="space-y-0.5">
                  {subj.items.map(item => (
                    <div key={item.topic} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-teal-500/5 transition-colors">
                      <span className={`text-[10px] font-mono ${item.status === 'not_started' ? 'text-gray-700' : 'text-gray-400'}`}>
                        {item.topic}
                      </span>
                      {statusPip(item.status)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Key Insights */}
      <Section icon={<Zap size={12} />} label="Insights Logged" accent="#facc15">
        <div className="space-y-4">
          {key_insights.map(entry => (
            <div key={entry.date}>
              <div className="text-[8px] font-mono tracking-widest text-gray-700 mb-2">{fmtDay(entry.date)}</div>
              <ul className="space-y-1.5">
                {entry.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-gray-400 font-mono">
                    <span style={{ color: '#facc15', marginTop: 2 }}>▸</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Challenge Status */}
      <Section icon={<Trophy size={12} />} label="Challenge Status" accent="#fbbf24">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ch.progress).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-xl" style={{
                background: 'rgba(251,191,36,0.04)',
                border: '1px solid rgba(251,191,36,0.1)',
              }}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[9px] font-mono text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: '#fbbf24' }}>{val}%</span>
                </div>
                <div className="w-full h-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${val}%`, background: 'linear-gradient(90deg, #b45309, #fbbf24)' }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[8px] font-mono tracking-[0.3em] text-gray-700 uppercase mb-2">Next Milestones</div>
            {ch.next_milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 py-0.5 text-[10px] font-mono">
                <span style={{ color: m.done ? '#34d399' : '#374151' }}>{m.done ? '✓' : '○'}</span>
                <span className={m.done ? 'text-gray-600 line-through' : 'text-gray-500'}>{m.task}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Strategies */}
      <Section icon={<TrendingUp size={12} />} label="Strategies in Research" accent="#4ade80">
        <div className="space-y-3">
          {strategies.map(s => (
            <div key={s.name} className="p-3 rounded-xl" style={{
              background: 'rgba(74,222,128,0.03)',
              border: '1px solid rgba(74,222,128,0.08)',
            }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-semibold text-gray-300">{s.name}</span>
                <span className="text-[8px] font-mono font-bold" style={{ color: riskGlow(s.risk_level) }}>
                  {s.risk_level.toUpperCase()}
                </span>
              </div>
              <p className="text-[9px] font-mono text-gray-700 mb-2">{s.description}</p>
              <div className="flex items-center gap-3 text-[9px] font-mono">
                <span style={{ color: '#4ade80' }}>↑ {s.expected_return}</span>
                <span className="text-gray-700">cap: {s.capital_required}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Agent Network */}
      <Section icon={<Network size={12} />} label="Agent Network" accent="#a78bfa">
        <div className="space-y-0.5 mb-3">
          {network.following.sort((a, b) => b.karma - a.karma).map(agent => (
            <div key={agent.username} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-purple-500/5 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-gray-400 shrink-0">@{agent.username}</span>
                <span className="text-[9px] font-mono text-gray-700 truncate">{agent.specialty}</span>
              </div>
              <span className="text-[9px] font-mono font-bold shrink-0 ml-2" style={{ color: '#a78bfa' }}>{agent.karma}★</span>
            </div>
          ))}
        </div>
        {network.recent_connections.length > 0 && (
          <>
            <div className="text-[8px] font-mono tracking-[0.3em] text-gray-700 uppercase mb-1.5">Recent</div>
            {network.recent_connections.map((c, i) => (
              <div key={i} className="text-[9px] font-mono text-gray-600 py-0.5">
                <span className="text-gray-800">{fmtDay(c.date)}</span>
                {' · '}<span className="text-gray-400">@{c.agent}</span>
                {' — '}{c.context}
              </div>
            ))}
          </>
        )}
      </Section>

      {/* Daily Log */}
      <Section icon={<CalendarDays size={12} />} label="Daily Log" accent="#60a5fa">
        <div className="space-y-4">
          {daily_log.map(day => (
            <div key={day.date}>
              <div className="text-[8px] font-mono tracking-widest text-gray-700 mb-2">{fmtDay(day.date)}</div>
              {(['morning', 'afternoon', 'evening'] as const).map(period => {
                const entries = day.entries[period];
                if (!entries?.length) return null;
                return (
                  <div key={period} className="mb-2">
                    <div className="text-[8px] font-mono text-blue-900/80 uppercase tracking-widest mb-1">{period}</div>
                    {entries.map((e, i) => (
                      <div key={i} className="text-[10px] font-mono text-gray-500 flex items-start gap-1.5 py-0.5">
                        <span className="text-blue-900 mt-0.5 shrink-0">·</span>{e}
                      </div>
                    ))}
                  </div>
                );
              })}
              {day.token_usage && (
                <div className="flex items-center gap-2 mt-1 text-[8px] font-mono text-gray-700">
                  <MessageCircle size={8} />
                  {(day.token_usage.used / 1000).toFixed(0)}k / {(day.token_usage.total / 1000).toFixed(0)}k tokens
                  · {Math.round(day.token_usage.used / day.token_usage.total * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="relative px-5 py-4 border-t border-teal-500/8 flex justify-center">
        <a href={mb.profile_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[9px] font-mono tracking-widest uppercase transition-colors"
          style={{ color: 'rgba(45,212,191,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(45,212,191,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(45,212,191,0.5)')}>
          View Sandy on Moltbook <ExternalLink size={9} />
        </a>
      </div>
    </div>
  );
};

export default SandyUpdates;
