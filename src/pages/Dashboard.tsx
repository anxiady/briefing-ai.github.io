import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Globe, BarChart3, Shield, Cpu, Zap, AlertTriangle,
  TrendingUp, TrendingDown, Activity, Rss, DollarSign, ExternalLink,
  Crosshair, Lock, RefreshCw
} from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';

// ===== Types =====
interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: string;
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

interface FearGreedData {
  value: string;
  value_classification: string;
}

interface PolymarketEvent {
  title: string;
  slug: string;
  volume: number;
  outcomes: string[];
  outcomePrices: number[];
}

interface ThreatItem {
  url: string;
  threat: string;
  date_added: string;
  host: string;
  tags: string[];
}

// ===== Config =====
const NEWS_CATEGORIES: Record<string, { label: string; color: string; bgColor: string; query: string }> = {
  politics: { label: 'Politics', color: 'text-red-400', bgColor: 'bg-red-500/20', query: '(politics OR election OR congress OR government)' },
  tech: { label: 'Tech & AI', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', query: '(technology OR artificial intelligence OR AI OR startup)' },
  finance: { label: 'Finance', color: 'text-green-400', bgColor: 'bg-green-500/20', query: '(finance OR stock market OR economy OR banking OR wall street)' },
  security: { label: 'Cybersecurity', color: 'text-orange-400', bgColor: 'bg-orange-500/20', query: '(cybersecurity OR hacking OR data breach OR cyber attack)' },
  conflicts: { label: 'Conflicts', color: 'text-rose-400', bgColor: 'bg-rose-500/20', query: '(war OR conflict OR military OR troops OR invasion)' },
  geopolitics: { label: 'Geopolitics', color: 'text-purple-400', bgColor: 'bg-purple-500/20', query: '(sanctions OR diplomacy OR NATO OR UN OR geopolitics)' },
};

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// ===== Helpers =====
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const formatPrice = (price: number) => {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(6)}`;
};

const formatVolume = (vol: number) => {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
};

const getFearGreedColor = (value: number) => {
  if (value <= 25) return 'text-red-500';
  if (value <= 45) return 'text-orange-400';
  if (value <= 55) return 'text-yellow-400';
  if (value <= 75) return 'text-green-400';
  return 'text-green-500';
};

// ===== Component =====
const Dashboard = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [crypto, setCrypto] = useState<CryptoData[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null);
  const [fearGreedLoading, setFearGreedLoading] = useState(true);
  const [polymarkets, setPolymarkets] = useState<PolymarketEvent[]>([]);
  const [polyLoading, setPolyLoading] = useState(true);
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [threatsLoading, setThreatsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch news from GDELT — staggered to avoid 429
  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const allItems: NewsItem[] = [];
      const categories = Object.entries(NEWS_CATEGORIES);

      for (let i = 0; i < categories.length; i++) {
        const [key, config] = categories[i];
        try {
          // Stagger requests by 800ms to avoid rate limiting
          if (i > 0) await delay(800);
          const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(config.query + ' sourcelang:english')}&timespan=24h&mode=artlist&maxrecords=5&format=json&sort=date`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const ct = res.headers.get('content-type');
          if (!ct?.includes('application/json')) continue;
          const data = await res.json();
          if (data?.articles) {
            data.articles.slice(0, 5).forEach((a: any) => {
              allItems.push({
                title: a.title || '',
                link: a.url || '#',
                source: a.domain || 'Unknown',
                category: key,
              });
            });
          }
        } catch { /* skip category */ }
      }
      setNews(allItems);
      setLastUpdated(new Date());
    } catch { /* fail silently */ }
    finally { setNewsLoading(false); }
  }, []);

  // Fetch crypto from CoinGecko (CORS ✅)
  const fetchCrypto = useCallback(async () => {
    setCryptoLoading(true);
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
      if (res.ok) setCrypto(await res.json());
    } catch { /* fail silently */ }
    finally { setCryptoLoading(false); }
  }, []);

  // Fetch Fear & Greed Index (CORS ✅)
  const fetchFearGreed = useCallback(async () => {
    setFearGreedLoading(true);
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.[0]) setFearGreed(data.data[0]);
      }
    } catch { /* fail silently */ }
    finally { setFearGreedLoading(false); }
  }, []);

  // Fetch Polymarket via CORS proxy
  const fetchPolymarket = useCallback(async () => {
    setPolyLoading(true);
    try {
      const targetUrl = encodeURIComponent('https://gamma-api.polymarket.com/events?limit=6&active=true&closed=false&order=volume&ascending=false');
      const res = await fetch(`${CORS_PROXY}${targetUrl}`);
      if (res.ok) {
        const data = await res.json();
        const events: PolymarketEvent[] = (data || []).slice(0, 6).map((e: any) => {
          const market = e.markets?.[0];
          let outcomes: string[] = [];
          let outcomePrices: number[] = [];
          try {
            outcomes = JSON.parse(market?.outcomes || '[]');
            outcomePrices = JSON.parse(market?.outcomePrices || '[]').map(Number);
          } catch { /* skip parse */ }
          return {
            title: e.title || market?.question || '',
            slug: e.slug || '',
            volume: Number(market?.volume || e.volume || 0),
            outcomes,
            outcomePrices,
          };
        }).filter((e: PolymarketEvent) => e.title);
        setPolymarkets(events);
      }
    } catch { /* fail silently */ }
    finally { setPolyLoading(false); }
  }, []);

  // Fetch cyber threats via CORS proxy (URLhaus recent JSON)
  const fetchThreats = useCallback(async () => {
    setThreatsLoading(true);
    try {
      const targetUrl = encodeURIComponent('https://urlhaus.abuse.ch/downloads/json_recent/');
      const res = await fetch(`${CORS_PROXY}${targetUrl}`);
      if (res.ok) {
        const data = await res.json();
        // json_recent format: { "id": [{ ... }], ... }
        const entries = Object.values(data).flat().slice(0, 8) as any[];
        setThreats(entries.map((u: any) => ({
          url: u.url || '',
          threat: u.threat || 'unknown',
          date_added: u.dateadded || '',
          host: new URL(u.url || 'https://unknown').hostname,
          tags: u.tags || [],
        })));
      }
    } catch { /* fail silently */ }
    finally { setThreatsLoading(false); }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchCrypto();
    fetchFearGreed();
    fetchPolymarket();
    fetchThreats();
  }, [fetchNews, fetchCrypto, fetchFearGreed, fetchPolymarket, fetchThreats]);

  const groupedNews = Object.keys(NEWS_CATEGORIES).reduce((acc, cat) => {
    acc[cat] = news.filter(n => n.category === cat);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  const fgValue = fearGreed ? parseInt(fearGreed.value) : 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden px-4 py-6">
      <BackgroundGradient />

      <div className="w-full max-w-7xl mx-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-briefing-purple transition-colors text-sm">
            <ArrowLeft size={18} />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[10px] text-gray-500 hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-briefing-purple border border-briefing-purple/30">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              Live
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-5 text-center" style={{
          background: 'linear-gradient(to right, #E0E7FF, #818CF8)',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          Briefing AI Intelligence Dashboard
        </h1>

        {/* Market Ticker Bar */}
        <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2.5 overflow-hidden">
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide">
            {/* Fear & Greed */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Activity size={13} className="text-gray-400" />
              <span className="text-[11px] text-gray-400">Fear & Greed</span>
              {fearGreedLoading ? (
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
              ) : fearGreed ? (
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-bold ${getFearGreedColor(fgValue)}`}>{fearGreed.value}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded bg-white/10 ${getFearGreedColor(fgValue)}`}>
                    {fearGreed.value_classification}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-gray-600">N/A</span>
              )}
            </div>

            <div className="w-px h-4 bg-white/10 flex-shrink-0"></div>

            {/* Top crypto tickers */}
            {cryptoLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-28 bg-white/10 rounded animate-pulse flex-shrink-0"></div>
              ))
            ) : (
              crypto.slice(0, 6).map(coin => (
                <div key={coin.id} className="flex items-center gap-1.5 flex-shrink-0">
                  <img src={coin.image} alt={coin.symbol} className="w-3.5 h-3.5 rounded-full" />
                  <span className="text-[11px] text-gray-400 font-medium uppercase">{coin.symbol}</span>
                  <span className="text-[11px] text-gray-100 font-mono">{formatPrice(coin.current_price)}</span>
                  <span className={`text-[10px] font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(1)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ===== LEFT COLUMN: News Feed (2 cols) ===== */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rss size={16} className="text-briefing-purple" />
                <h2 className="font-bold text-gray-100 text-sm">Global News Feed</h2>
                <span className="text-[10px] text-gray-500">GDELT</span>
              </div>
              {newsLoading && (
                <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                  <RefreshCw size={10} className="animate-spin" />
                  Loading categories...
                </span>
              )}
            </div>

            {newsLoading && news.length === 0 ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                    <div className="h-3 bg-white/10 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-full mb-1"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : !newsLoading && news.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-8 text-center">
                <AlertTriangle size={20} className="mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-400">Unable to load news feed. Try refreshing the page.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(NEWS_CATEGORIES).map(([key, config]) => {
                  const items = groupedNews[key] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={key} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/[0.07] transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 ${config.bgColor} ${config.color} text-[10px] font-bold uppercase tracking-wider rounded`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-gray-600">{items.length} articles</span>
                      </div>
                      <div className="space-y-2">
                        {items.map((item, i) => (
                          <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group">
                            <span className="text-[10px] text-gray-600 mt-0.5 flex-shrink-0">{i + 1}.</span>
                            <div className="min-w-0">
                              <p className="text-[13px] text-gray-200 leading-snug group-hover:text-white transition-colors line-clamp-2">
                                {item.title}
                              </p>
                              <span className="text-[10px] text-gray-500">{item.source}</span>
                            </div>
                            <ExternalLink size={10} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-5">

            {/* Crypto Markets */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-green-400" />
                  <h3 className="font-bold text-gray-100 text-sm">Crypto Markets</h3>
                </div>
                <span className="text-[9px] text-gray-500">CoinGecko</span>
              </div>

              {cryptoLoading ? (
                <div className="space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-7 bg-white/10 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : crypto.length > 0 ? (
                <div className="space-y-0.5">
                  {crypto.map((coin, i) => (
                    <div key={coin.id} className="flex items-center justify-between py-1.5 px-1 rounded hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-gray-600 w-3 text-right">{i + 1}</span>
                        <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full flex-shrink-0" />
                        <span className="text-xs text-gray-200 font-medium truncate">{coin.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-xs text-gray-100 font-mono">{formatPrice(coin.current_price)}</div>
                        <div className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                          {Math.abs(coin.price_change_percentage_24h)?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">Unable to load market data</p>
              )}
            </div>

            {/* Prediction Markets */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crosshair size={14} className="text-indigo-400" />
                  <h3 className="font-bold text-gray-100 text-sm">Prediction Markets</h3>
                </div>
                <span className="text-[9px] text-gray-500">Polymarket</span>
              </div>

              {polyLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-white/10 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : polymarkets.length > 0 ? (
                <div className="space-y-2">
                  {polymarkets.map((market, i) => (
                    <a
                      key={i}
                      href={`https://polymarket.com/event/${market.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <p className="text-xs text-gray-200 leading-snug mb-1 group-hover:text-white transition-colors line-clamp-2">
                        {market.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {market.outcomes.slice(0, 2).map((outcome, j) => (
                          <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded ${j === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {outcome}: {(market.outcomePrices[j] * 100).toFixed(0)}%
                          </span>
                        ))}
                        {market.volume > 0 && (
                          <span className="text-[9px] text-gray-600 ml-auto">Vol: {formatVolume(market.volume)}</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">Unable to load predictions</p>
              )}
            </div>

            {/* Cyber Threats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-red-400" />
                  <h3 className="font-bold text-gray-100 text-sm">Cyber Threats</h3>
                </div>
                <span className="text-[9px] text-gray-500">URLhaus</span>
              </div>

              {threatsLoading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 bg-white/10 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : threats.length > 0 ? (
                <div className="space-y-1">
                  {threats.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <Lock size={10} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-300 truncate font-mono" title={t.url}>
                          {t.host}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] px-1 py-0.5 bg-red-500/20 text-red-400 rounded uppercase font-medium">
                            {t.threat}
                          </span>
                          {t.tags.length > 0 && (
                            <span className="text-[9px] text-gray-500">{t.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">Unable to load threat data</p>
              )}
            </div>

            {/* Data Sources */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="font-bold text-gray-100 text-sm mb-3">Data Sources</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  { name: 'GDELT News', ok: news.length > 0, loading: newsLoading },
                  { name: 'CoinGecko', ok: crypto.length > 0, loading: cryptoLoading },
                  { name: 'Fear & Greed', ok: !!fearGreed, loading: fearGreedLoading },
                  { name: 'Polymarket', ok: polymarkets.length > 0, loading: polyLoading },
                  { name: 'URLhaus', ok: threats.length > 0, loading: threatsLoading },
                ].map((src) => (
                  <div key={src.name} className="flex items-center justify-between">
                    <span className="text-gray-400">{src.name}</span>
                    {src.loading ? (
                      <span className="text-yellow-400 flex items-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                        Loading
                      </span>
                    ) : src.ok ? (
                      <span className="text-green-400 flex items-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        Live
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        Offline
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[11px] text-gray-600">
          <p>Briefing AI • Data from GDELT, CoinGecko, Alternative.me, Polymarket, URLhaus</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
