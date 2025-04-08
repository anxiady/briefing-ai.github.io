
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been added to the newsletter.",
      });
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 sm:flex-1 bg-white shadow-md border-2 border-briefing-blue/10 focus-visible:ring-2 focus-visible:ring-briefing-blue/40"
        required
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        className="h-12 px-8 bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
      >
        {isLoading ? "Subscribing..." : "Get the newsletter"}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
