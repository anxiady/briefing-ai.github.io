
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const validateEmail = (email: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: t('newsletter.errorTitle'),
        description: t('newsletter.errorInvalidEmail'),
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateEmail(email)) {
      setIsLanguageDialogOpen(true);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Create form data manually since we're not submitting the form directly
      const formData = new FormData();
      formData.append('form-name', 'newsletter');
      formData.append('email', email);
      formData.append('language', selectedLanguage);

      await fetch('/', {
        method: 'POST',
        body: formData,
      });

      // Set user's preferred language
      i18n.changeLanguage(selectedLanguage);

      toast({
        title: t('newsletter.successTitle'),
        description: t('newsletter.successDescription'),
      });
      
      setEmail('');
      setIsLanguageDialogOpen(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: t('newsletter.errorTitle'),
        description: t('newsletter.errorSubmitFail'),
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsLanguageDialogOpen(false);
  };

  return (
    <>
      <form
        name="newsletter"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleInitialSubmit}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto"
      >
        <input type="hidden" name="form-name" value="newsletter" />
        <input type="hidden" name="language" value={selectedLanguage} />
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
          className="h-14 px-8 text-lg bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
        >
          {t('newsletter.cta')}
        </Button>
      </form>

      <AlertDialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              {t('newsletter.languagePreference')}
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="py-4">
            <RadioGroup 
              value={selectedLanguage} 
              onValueChange={setSelectedLanguage}
              className="flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="flex-1 cursor-pointer font-medium">
                  English
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="zh" id="zh" />
                <Label htmlFor="zh" className="flex-1 cursor-pointer font-medium">
                  中文 (Mandarin)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {t('newsletter.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalSubmit}
              className="bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
            >
              {t('newsletter.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NewsletterSignup;
