import React from 'react';

interface CognizantLogoProps {
  width?: number;
  height?: number;
  color?: string;
}

const CognizantLogo: React.FC<CognizantLogoProps> = ({ 
  width = 120, 
  height = 24,
  color = '#ffffff'
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cognizant wordmark */}
      <text
        x="0"
        y="30"
        fontFamily="Arial, sans-serif"
        fontSize="32"
        fontWeight="bold"
        fill={color}
        letterSpacing="-1"
      >
        Cognizant
      </text>
      {/* Distinctive dot/accent */}
      <circle cx="193" cy="8" r="5" fill="#0033A1" />
    </svg>
  );
};

export default CognizantLogo;
