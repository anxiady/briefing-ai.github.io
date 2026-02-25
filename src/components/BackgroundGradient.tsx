import React from 'react';

// Deterministic star positions via golden-ratio sequence — no Math.random()
const PHI = 0.618033988749895;
const STARS = Array.from({ length: 220 }, (_, i) => ({
  x: +((i * PHI * 100) % 100).toFixed(3),
  y: +((i * (1 - PHI) * 161.8) % 100).toFixed(3),
  r: i % 22 === 0 ? 2 : i % 7 === 0 ? 1.5 : 1,
  o: +(0.12 + (i % 9) * 0.075).toFixed(2),
  color: i % 5 === 0 ? '#b0c8ff' : i % 8 === 0 ? '#aff5ff' : '#ffffff',
  pulse: i % 13 === 0,
}));

const BackgroundGradient = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: '#020309' }}>

    {/* Coordinate grid */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }}
    />

    {/* Stars */}
    {STARS.map((s, i) => (
      <div
        key={i}
        className={s.pulse ? 'animate-pulse' : ''}
        style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.r}px`,
          height: `${s.r}px`,
          borderRadius: '50%',
          background: s.color,
          opacity: s.o,
          boxShadow: s.r >= 1.5 ? `0 0 ${s.r * 3}px ${s.color}` : 'none',
        }}
      />
    ))}

    {/* Nebula blobs */}
    <div
      className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full"
      style={{
        background: 'radial-gradient(ellipse, rgba(88,28,220,0.35) 0%, transparent 70%)',
        filter: 'blur(90px)',
        animation: 'nb1 20s ease-in-out infinite',
      }}
    />
    <div
      className="absolute top-1/3 -left-60 w-[600px] h-[600px] rounded-full"
      style={{
        background: 'radial-gradient(ellipse, rgba(8,100,130,0.3) 0%, transparent 70%)',
        filter: 'blur(100px)',
        animation: 'nb2 26s ease-in-out infinite',
      }}
    />
    <div
      className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full"
      style={{
        background: 'radial-gradient(ellipse, rgba(30,58,120,0.25) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'nb3 22s ease-in-out infinite',
      }}
    />
    <div
      className="absolute top-2/3 left-1/3 w-[400px] h-[400px] rounded-full"
      style={{
        background: 'radial-gradient(ellipse, rgba(4,80,70,0.2) 0%, transparent 70%)',
        filter: 'blur(70px)',
        animation: 'nb1 30s ease-in-out infinite reverse',
      }}
    />
    <div
      className="absolute top-10 left-1/2 w-[350px] h-[350px] rounded-full"
      style={{
        background: 'radial-gradient(ellipse, rgba(120,10,100,0.18) 0%, transparent 70%)',
        filter: 'blur(70px)',
        animation: 'nb2 17s ease-in-out infinite',
      }}
    />

    <style>{`
      @keyframes nb1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(50px, 35px) scale(1.06); }
      }
      @keyframes nb2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-40px, 50px) scale(0.96); }
      }
      @keyframes nb3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(35px, -30px) scale(1.04); }
      }
    `}</style>
  </div>
);

export default BackgroundGradient;
