
import React from 'react';
import { Check } from 'lucide-react';

interface BenefitItemProps {
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => {
  return (
    <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-briefing-blue to-briefing-purple flex items-center justify-center mr-2">
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className="text-xs sm:text-sm text-gray-700">{text}</span>
    </div>
  );
};

export default BenefitItem;
