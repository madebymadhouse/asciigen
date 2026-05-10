'use client';

import React from 'react';
import { Btn } from './Btn';
import { GithubIcon } from './GithubIcon';

export function Nav() {
  return (
    <nav style={{
      position: 'fixed',
      top: '12px',
      left: '12px',
      right: '12px',
      height: 'var(--nav-h)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px 0 20px',
      background: 'var(--nav-bg)',
      backdropFilter: 'var(--glass-blur-nav)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shadow)',
      borderRadius: '14px',
      zIndex: 1000,
    }}>
      <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>asciigen</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Btn
          href="https://github.com/samhcharles/asciigen"
          style={{ padding: '8px' }}
          ariaLabel="Source"
        >
          <GithubIcon size={16} />
        </Btn>
        <Btn glint="prism" filled href="/studio">
          Studio
        </Btn>
      </div>
    </nav>
  );
}
