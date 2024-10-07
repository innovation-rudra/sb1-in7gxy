import React from 'react';

interface SpeedGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

const SpeedGauge: React.FC<SpeedGaugeProps> = ({ label, value, max, unit, color }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = isNaN(progress) ? circumference : circumference * (1 - progress);

  const getColor = (color: string) => {
    switch (color) {
      case 'blue':
        return '#3b82f6';
      case 'green':
        return '#10b981';
      case 'purple':
        return '#8b5cf6';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="20"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={getColor(color)}
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-current">
          {value.toFixed(1)}
        </text>
        <text x="100" y="130" textAnchor="middle" className="text-sm fill-gray-400">
          {unit}
        </text>
      </svg>
      <p className="mt-2 text-lg font-semibold">{label}</p>
    </div>
  );
};

export default SpeedGauge;