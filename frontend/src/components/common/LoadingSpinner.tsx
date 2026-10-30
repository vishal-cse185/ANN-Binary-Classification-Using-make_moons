import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Processing Neural Calculations...',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div
          className={`${sizeMap[size]} rounded-full border-indigo-500/20 border-t-indigo-500 border-r-cyan-400 animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
      </div>
      {label && (
        <p className="text-sm font-medium text-slate-400 font-mono tracking-wide animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
