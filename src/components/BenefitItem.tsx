
import React from 'react';
import { Check } from 'lucide-react';

interface BenefitItemProps {
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-briefing-blue to-briefing-purple flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className="text-sm sm:text-base text-gray-700">{text}</span>
    </div>
  );
};

export default BenefitItem;
