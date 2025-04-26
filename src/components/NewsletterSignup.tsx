
// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// const NewsletterSignup = () => {
//   const [email, setEmail] = useState('');
//   const { t } = useTranslation();

//   return (
//     <form
//       name="newsletter"
//       method="POST"
//       data-netlify="true"
//       netlify-honeypot="bot-field"
//       className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto"
//     >
//       <input type="hidden" name="form-name" value="newsletter" />
//       <p hidden>
//         <label>
//           Don't fill this out if you're human:
//           <input name="bot-field" />
//         </label>
//       </p>
//       <Input
//         type="email"
//         name="email"
//         placeholder={t('newsletter.placeholder')}
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="h-12 sm:flex-1 bg-white shadow-[0_4px_12px_-2px_rgba(142,86,246,0.35),0_2px_6px_-2px_rgba(142,86,246,0.2)] border-2 border-briefing-blue/10 focus-visible:ring-2 focus-visible:ring-briefing-blue/40"
//         required
//       />
//       <Button 
//         type="submit" 
//         className="h-12 px-8 bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
//       >
//         {t('newsletter.cta')}
//       </Button>
//     </form>
//   );
// };

// export default NewsletterSignup;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await fetch('/', {
        method: 'POST',
        body: formData,
      });
      toast({
        title: "Success!",
        description: "You've been added to the newsletter.",
      });
      setEmail('');
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
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
      className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto"
    >
      <input type="hidden" name="form-name" value="newsletter" />
      <p hidden>
        <label>
          Don’t fill this out if you're human:
          <input name="bot-field" />
        </label>
      </p>
      <Input
        type="email"
        name="email"
        placeholder={t('newsletter.placeholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 sm:flex-1 bg-white shadow-[0_4px_12px_-2px_rgba(142,86,246,0.35),0_2px_6px_-2px_rgba(142,86,246,0.2)] border-2 border-briefing-blue/10 focus-visible:ring-2 focus-visible:ring-briefing-blue/40"
        required
      />
      <Button 
        type="submit" 
        className="h-12 px-8 bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
      >
        {t('newsletter.cta')}
      </Button>
    </form>
  );
};

export default NewsletterSignup;

