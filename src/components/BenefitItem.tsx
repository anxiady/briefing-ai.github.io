
import React from 'react';
import { Check } from 'lucide-react';

interface BenefitItemProps {
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => {
  return (
    <div className="flex items-center p-1 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-briefing-blue to-briefing-purple flex items-center justify-center mr-2 opacity-80">
        <Check className="w-2 h-2 text-white" />
      </div>
      <span className="text-xs text-gray-600">{text}</span>
    </div>
  );
};

export default BenefitItem;
