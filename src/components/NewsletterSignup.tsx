
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  return (
    <form
      name="newsletter"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto"
    >
      <input type="hidden" name="form-name" value="newsletter" />
      <p hidden>
        <label>
          Don't fill this out if you're human:
          <input name="bot-field" />
        </label>
      </p>
      <Input
        type="email"
        name="email"
        placeholder={t('newsletter.placeholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-14 text-lg sm:flex-1 bg-white shadow-[0_4px_12px_-2px_rgba(142,86,246,0.35),0_2px_6px_-2px_rgba(142,86,246,0.2)] border-2 border-briefing-blue/10 focus-visible:ring-2 focus-visible:ring-briefing-blue/40"
        required
      />
      <Button 
        type="submit" 
        className="h-14 px-10 text-lg bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
      >
        {t('newsletter.cta')}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
