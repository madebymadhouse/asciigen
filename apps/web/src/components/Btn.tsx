'use client';

import React from 'react';

interface BtnProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  glint?: 'prism' | 'lava' | 'cloud' | null;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export function Btn({
  children,
  onClick,
  href,
  glint,
  filled,
  className = '',
  style,
  ariaLabel,
}: BtnProps) {
  const baseClass = `btn ${glint ? `btn-glint btn-glint--${glint}` : ''} ${className}`;
  
  const styles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-btn)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: filled ? 'none' : '1px solid var(--btn-border)',
    background: filled ? 'var(--btn-primary-bg)' : 'var(--btn-bg)',
    color: filled ? 'var(--btn-primary-text)' : 'var(--btn-color)',
    backdropFilter: filled ? 'none' : 'blur(12px)',
    transition: 'all var(--dur-fast) var(--ease-quart)',
    textDecoration: 'none',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!filled) {
      e.currentTarget.style.background = 'var(--btn-bg-hov)';
      e.currentTarget.style.borderColor = 'var(--btn-border-hov)';
      e.currentTarget.style.color = 'var(--btn-color-hov)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!filled) {
      e.currentTarget.style.background = 'var(--btn-bg)';
      e.currentTarget.style.borderColor = 'var(--btn-border)';
      e.currentTarget.style.color = 'var(--btn-color)';
    }
  };

  if (href) {
    return (
      <a 
        href={href} 
        className={baseClass} 
        style={styles}
        aria-label={ariaLabel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <button 
      className={baseClass} 
      style={styles} 
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}
