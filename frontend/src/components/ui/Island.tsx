import type { ReactNode } from 'react';

/** Card container ("island") shared by every module page. */
export function Island({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <article className={`island ${className}`}>{children}</article>;
}

export function IslandHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <header className={`island-header ${className}`}>{children}</header>;
}

export function IslandBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`island-body ${className}`}>{children}</div>;
}
