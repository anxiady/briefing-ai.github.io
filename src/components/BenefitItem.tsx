
import React from 'react';
import { Check } from 'lucide-react';

interface BenefitItemProps {
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => {
  return (
    <div className="flex items-center p-1.5 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-briefing-blue/40 to-briefing-purple/40 flex items-center justify-center mr-1.5">
        <Check className="w-2.5 h-2.5 text-white/90" />
      </div>
      <span className="text-xs text-gray-500">{text}</span>
    </div>
  );
};

export default BenefitItem;
