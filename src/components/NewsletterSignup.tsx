
// import React, { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast";

// const NewsletterSignup = () => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
  
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email || !email.includes('@')) {
//       toast({
//         title: "Please enter a valid email",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     setIsLoading(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       toast({
//         title: "Success!",
//         description: "You've been added to the newsletter.",
//       });
//       setEmail('');
//       setIsLoading(false);
//     }, 1000);
//   };
  
//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
//       <Input
//         type="email"
//         placeholder="Your email address"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className="h-12 sm:flex-1 bg-white shadow-[0_4px_12px_-2px_rgba(142,86,246,0.35),0_2px_6px_-2px_rgba(142,86,246,0.2)] border-2 border-briefing-blue/10 focus-visible:ring-2 focus-visible:ring-briefing-blue/40"
//         required
//       />
//       <Button 
//         type="submit" 
//         disabled={isLoading}
//         className="h-12 px-8 bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
//       >
//         {isLoading ? "Subscribing..." : "Get the newsletter"}
//       </Button>
//     </form>
//   );
// };

// export default NewsletterSignup;

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');

  return (
    <form
      name="newsletter"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
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
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 sm:flex-1 bg-white shadow-[0_4px_12px_-2px_rgba(142,86,246,0.35),0_2px_6px_-2px_rgba(142,86,246,0.2)] border-2 border-briefing-blue/10 focus-visible:ring-2 focus-visible:ring-briefing-blue/40"
        required
      />
      <Button 
        type="submit" 
        className="h-12 px-8 bg-gradient-to-r from-briefing-blue to-briefing-purple text-white hover:opacity-90 transition-opacity"
      >
        Get the newsletter
      </Button>
    </form>
  );
};

export default NewsletterSignup;

