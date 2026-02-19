
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard } from 'lucide-react';
import BackgroundGradient from '@/components/BackgroundGradient';
import NewsletterSignup from '@/components/NewsletterSignup';
import BenefitItem from '@/components/BenefitItem';

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      <BackgroundGradient />
      
      <div className="w-full max-w-5xl mx-auto text-center z-10">
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-briefing-blue border border-briefing-blue/10 shadow-sm">
            briefing.ai
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-briefing-blue text-white rounded-full text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 mx-auto leading-none whitespace-normal" 
            style={{
              background: 'linear-gradient(to right, #1A1F2C, #4F46E5)',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
          {t('hero.subtitle')}
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          {t('hero.description')}
        </p>
        
        <div className="mb-10">
          <NewsletterSignup />
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="grid sm:grid-cols-3 gap-4 opacity-80">
            <BenefitItem text={t('benefits.simple')} />
            <BenefitItem text={t('benefits.comprehensive')} />
            <BenefitItem text={t('benefits.quick')} />
          </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          {t('newsletter.join')}
        </div>
      </div>
    </div>
  );
};

export default Index;
