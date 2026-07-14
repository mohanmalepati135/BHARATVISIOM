import { cn } from '@/lib/utils';

interface RatingSliderProps {
  label: string;
  help?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function RatingSlider({ label, help, value, onChange, min = 1, max = 10 }: RatingSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div>
          <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
          {help && <p className="text-xs text-[var(--color-ink-muted)]">{help}</p>}
        </div>
        <span className="mono-figure text-sm font-semibold text-[var(--color-accent)] tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn('w-full h-1.5 rounded-full appearance-none cursor-pointer bv-slider')}
        style={{
          background: `linear-gradient(to right, var(--color-accent) ${percent}%, var(--color-border) ${percent}%)`,
        }}
      />
    </div>
  );
}
