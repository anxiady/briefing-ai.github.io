
import React from 'react';

const BackgroundGradient = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-briefing-purple/20 blur-3xl"></div>
      <div className="absolute top-80 -left-40 h-96 w-96 rounded-full bg-briefing-blue/20 blur-3xl"></div>
    </div>
  );
};

export default BackgroundGradient;
