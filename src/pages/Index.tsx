
import React from 'react';
import BackgroundGradient from '@/components/BackgroundGradient';
import NewsletterSignup from '@/components/NewsletterSignup';
import BenefitItem from '@/components/BenefitItem';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      <BackgroundGradient />
      
      <div className="w-full max-w-5xl mx-auto text-center z-10">
        <div className="mb-8 inline-block">
          <div className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-briefing-blue border border-briefing-blue/10 shadow-sm">
            briefing.ai
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 mx-auto leading-none whitespace-normal">
          AI News Made Simple and Human.
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Delivered twice a week. No hype, no jargon — just the real story.
        </p>
        
        <div className="mb-12">
          <NewsletterSignup />
        </div>
        
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-10">
          <BenefitItem text="Explains AI like you're 12 (in a good way)" />
          <BenefitItem text="Covers tools, models, funding, and startups" />
          <BenefitItem text="Takes 2 minutes to read" />
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          Join thousands of curious readers getting smarter about AI.
        </div>
      </div>
    </div>
  );
};

export default Index;
