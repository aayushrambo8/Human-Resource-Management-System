import { Icon, type IconName } from './Icon';
import { Island, IslandBody } from './Island';

export type KpiTone = 'blue' | 'green' | 'amber' | 'rose';

interface KpiCardProps {
  label: string;
  /** Preformatted value — callers decide how to derive it from verified API data. */
  value: string;
  icon: IconName;
  tone?: KpiTone;
  /** Small clarifying line under the label (e.g. how a metric is defined). */
  hint?: string;
}

export function KpiCard({ label, value, icon, tone = 'blue', hint }: KpiCardProps) {
  return (
    <Island className="island-metric">
      <IslandBody>
        <div className="metric-top">
          <div className="metric-heading">
            <span className="metric-label">{label}</span>
            {hint && <span className="metric-hint">{hint}</span>}
          </div>
          <span className={`metric-icon metric-icon-${tone}`}>
            <Icon name={icon} size={20} />
          </span>
        </div>
        <div className="metric-value">{value}</div>
      </IslandBody>
    </Island>
  );
}
