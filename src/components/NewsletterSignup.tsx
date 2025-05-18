
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Globe } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: t('newsletter.errorTitle'),
        description: t('newsletter.errorInvalidEmail'),
        variant: "destructive",
      });
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('language', language);

    try {
      await fetch('/', {
        method: 'POST',
        body: formData,
      });
      toast({
        title: t('newsletter.successTitle'),
        description: t('newsletter.successDescription'),
      });
      setEmail('');
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: t('newsletter.errorTitle'),
        description: t('newsletter.errorSubmitFail'),
        variant: "destructive",
      });
    }
  };

  return (
    <form
      name="newsletter"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-xl mx-auto"
    >
      <input type="hidden" name="form-name" value="newsletter" />
      <p hidden>
        <label>
          Don't fill this out if you're human:
          <input name="bot-field" />
        </label>
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          name="email"
          placeholder={t('newsletter.placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 sm:flex-1 text-base bg-white shadow-[0_4px_12px_-2px_rgba(142,86,246,0.35),0_2px_6px_-2px_rgba(142,86,246,0.2)] border-2 border-briefing-blue/10 focus-visible:ring-2 focus-visible:ring-briefing-blue/40"
          required
        />
        <Button 
          type="submit" 
          className="h-14 px-10 text-base bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
        >
          {t('newsletter.cta')}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1 mx-auto">
        <Globe className="h-4 w-4 text-gray-500 mr-1" />
        <RadioGroup 
          defaultValue="en" 
          value={language} 
          onValueChange={setLanguage}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="en" id="en" />
            <label htmlFor="en" className="text-xs text-gray-600 cursor-pointer">English</label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="zh" id="zh" />
            <label htmlFor="zh" className="text-xs text-gray-600 cursor-pointer">中文</label>
          </div>
        </RadioGroup>
      </div>
    </form>
  );
};

export default NewsletterSignup;
