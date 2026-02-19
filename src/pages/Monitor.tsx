import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Monitor = () => {
  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/90 backdrop-blur-sm z-10">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-gray-300 hover:text-briefing-purple transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-briefing-purple border border-briefing-purple/30">
          Situation Monitor
        </div>
      </div>

      {/* Embedded Situation Monitor */}
      <iframe
        src="https://hipcityreg-situation-monitor.vercel.app/"
        className="flex-1 w-full border-none"
        title="Situation Monitor"
        allow="clipboard-read; clipboard-write"
        loading="eager"
      />
    </div>
  );
};

export default Monitor;
