import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Icon, AnimateIcon, type IconName } from './Icon';

describe('Animate UI Icon Component', () => {
  it('renders SVG for basic icon types with correct default attributes', () => {
    const { container } = render(<Icon name="clock" size={20} className="custom-clock" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('custom-clock');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
    expect(svg).toHaveAttribute('stroke-width', '1.75');
  });

  it('renders different icon shapes cleanly', () => {
    const sampleIcons: IconName[] = ['bell', 'refresh', 'fingerprint', 'shield', 'settings', 'user'];
    for (const name of sampleIcons) {
      const { container } = render(<Icon name={name} size={16} data-testid={`icon-${name}`} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    }
  });

  it('renders fallback icon gracefully for unrecognized icon name', () => {
    // @ts-expect-error testing invalid icon name runtime fallback
    const { container } = render(<Icon name="non-existent-icon" size={14} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('works smoothly inside an Animate UI AnimateIcon wrapper', () => {
    const { container } = render(
      <AnimateIcon animateOnHover asChild>
        <button type="button" aria-label="Notification bell">
          <Icon name="bell" size={18} />
          <span>Alerts</span>
        </button>
      </AnimateIcon>
    );
    const button = container.querySelector('button');
    const svg = container.querySelector('svg');
    expect(button).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
  });

  it('respects animateOnHover={false}', () => {
    const { container } = render(<Icon name="arrow" size={14} animateOnHover={false} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
