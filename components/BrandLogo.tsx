import React from 'react';

type IconProps = {
  className?: string;
};

const personaColors: Record<string, string> = {
    gemini: 'var(--gradient-from)',
    gpt: 'var(--gradient-from)',
    deepseek: 'var(--gradient-from)',
    claude: 'var(--gradient-from)',
};

export const BrandLogo: React.FC<IconProps> = ({ className }) => (
  <div className={className} style={{ color: 'var(--accent-color)'}}>
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20,15 L35,15 L35,42.5 L65,42.5 L65,15 L80,15 L80,85 L65,85 L65,57.5 L35,57.5 L35,85 L20,85 Z M40,20 L60,20 L60,37.5 L40,37.5 Z M40,62.5 L60,62.5 L60,80 L40,80 Z" />
    </svg>
  </div>
);