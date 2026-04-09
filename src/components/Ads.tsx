import React, { useEffect, useRef, useState } from 'react';

export const BannerAd: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    containerRef.current.innerHTML = '';

    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.innerHTML = `
      atOptions = {
        'key' : 'd13eecb4d2dfae003d0bc56184f4785b',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = 'https://www.highperformanceformat.com/d13eecb4d2dfae003d0bc56184f4785b/invoke.js';

    containerRef.current.appendChild(script1);
    containerRef.current.appendChild(script2);
  }, [refreshKey]);

  return (
    <div className="flex justify-center w-full overflow-hidden my-4" ref={containerRef}></div>
  );
};

export const NativeBannerAd: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    containerRef.current.innerHTML = '<div id="container-1134ceb0b303a181d9a78c8b0589841b"></div>';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl29081286.profitablecpmratenetwork.com/1134ceb0b303a181d9a78c8b0589841b/invoke.js';

    containerRef.current.appendChild(script);
  }, [refreshKey]);

  return (
    <div className="flex justify-center w-full my-4" ref={containerRef}></div>
  );
};
