
import { useEffect, useState } from "react";

interface PromoBannerProps {
  messages: string[];
}

const PromoBanner = ({ messages }: PromoBannerProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="w-full bg-primary text-white py-3 text-center">
      <p className="text-sm md:text-base animate-fade-in">
        {messages[currentMessageIndex]}
      </p>
    </div>
  );
};

export default PromoBanner;
