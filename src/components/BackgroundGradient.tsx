
import React from 'react';

const BackgroundGradient = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div 
        className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-briefing-purple/20 blur-3xl"
        style={{
          animation: 'move1 15s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-briefing-blue/20 blur-3xl"
        style={{
          animation: 'move2 20s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-briefing-blue/10 blur-3xl"
        style={{
          animation: 'move3 18s ease-in-out infinite'
        }}
      ></div>
      <style>{`
        @keyframes move1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, 20px) rotate(10deg); }
        }
        @keyframes move2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 30px) rotate(-8deg); }
        }
        @keyframes move3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(25px, -20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default BackgroundGradient;
