import React, { useEffect, useState } from 'react'; // Import React and hooks

const Home = () => {
  // To determine if dark mode is active for conditional styling if needed in JS,
  // though it's better to handle this via CSS with data-theme attribute.
  const [isDark, setIsDark] = useState(document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    // Optional: Listen to changes on data-theme if needed for dynamic JS logic
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // The text-shadow is now handled by CSS using [data-theme="dark"] selector in index.css

  return (
    <div className="home-container">
      {/* Title with Open Sans */}
      <h1 className="home-title">
        TritonThenix
      </h1>

      <div className="home-subtitle-container">
        <p className="home-subtitle">
          Welcome to the TritonThenix family. Join our community of fitness enthusiasts and transform your journey.
        </p>
      </div>
    </div>
  );
};

export default Home;