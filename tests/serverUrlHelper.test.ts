import { describe, expect, it } from 'vitest';
import { getServerUrlCandidates } from '../src/lib/utils/serverUrlHelper';

describe('getServerUrlCandidates', () => {
  it('uses a complete URL as-is', () => {
    expect(getServerUrlCandidates('https://laneh.example.com:8443')).toEqual(['https://laneh.example.com:8443']);
  });

  it('tries https before http when the protocol is missing', () => {
    expect(getServerUrlCandidates('laneh.example.com:8443')).toEqual([
      'https://laneh.example.com:8443',
      'http://laneh.example.com:8443'
    ]);
  });

  it('tries the fallback ports when the port is missing', () => {
    expect(getServerUrlCandidates('http://192.168.1.5')).toEqual([
      'http://192.168.1.5',
      'http://192.168.1.5:5173',
      'http://192.168.1.5:3000'
    ]);
  });

  it('combines both fallbacks, trying each port with both protocols', () => {
    expect(getServerUrlCandidates('laneh.local')).toEqual([
      'https://laneh.local',
      'http://laneh.local',
      'https://laneh.local:5173',
      'http://laneh.local:5173',
      'https://laneh.local:3000',
      'http://laneh.local:3000'
    ]);
  });

  it('keeps paths and handles IPv6 hosts', () => {
    expect(getServerUrlCandidates('  [::1]/laneh/  ')).toEqual([
      'https://[::1]/laneh',
      'http://[::1]/laneh',
      'https://[::1]:5173/laneh',
      'http://[::1]:5173/laneh',
      'https://[::1]:3000/laneh',
      'http://[::1]:3000/laneh'
    ]);
  });

  it('returns nothing for empty input', () => {
    expect(getServerUrlCandidates('   ')).toEqual([]);
  });
});
