'use client';

interface CharacterCounterProps {
  current: number;
  max: number;
  label?: string;
}

export function CharacterCounter({ current, max, label }: CharacterCounterProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  let colorClass = 'text-gray-400';
  if (percentage >= 100) {
    colorClass = 'text-red-500';
  } else if (percentage >= 80) {
    colorClass = 'text-amber-500';
  }

  return (
    <span className={`text-xs ${colorClass}`} style={{ fontFamily: 'system-ui' }}>
      {label ? `${label} (` : ''}
      {current}/{max} characters
      {label ? ')' : ''}
    </span>
  );
}
