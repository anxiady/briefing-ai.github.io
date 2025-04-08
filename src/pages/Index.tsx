
import React from 'react';
import BackgroundGradient from '@/components/BackgroundGradient';
import NewsletterSignup from '@/components/NewsletterSignup';
import BenefitItem from '@/components/BenefitItem';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      <BackgroundGradient />
      
      <div className="max-w-3xl w-full mx-auto text-center z-10">
        <div className="mb-4 inline-block">
          <div className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-briefing-blue border border-briefing-blue/10 shadow-sm">
            briefing.ai
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          AI News You Can Actually Understand.
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Delivered twice a week. No hype, no jargon — just the real story.
        </p>
        
        <div className="mb-10">
          <NewsletterSignup />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-8 space-y-4 sm:space-y-0 mb-8">
          <BenefitItem text="Explains AI like you're 12 (in a good way)" />
          <BenefitItem text="Covers tools, models, funding, and startups" />
          <BenefitItem text="Takes 2 minutes to read" />
        </div>
        
        <div className="mt-10 text-sm text-gray-500">
          Join thousands of curious readers getting smarter about AI.
        </div>
      </div>
    </div>
  );
};

export default Index;
