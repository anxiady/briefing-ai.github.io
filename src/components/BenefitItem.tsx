
import React from 'react';
import { Check } from 'lucide-react';

interface BenefitItemProps {
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ text }) => {
  return (
    <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-briefing-blue to-briefing-purple flex items-center justify-center mr-3">
        <Check className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-sm sm:text-base text-gray-700">{text}</span>
    </div>
  );
};

export default BenefitItem;
