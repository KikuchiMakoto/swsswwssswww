import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('PWA Assets and Configuration', () => {
  const root = resolve(import.meta.dir, '..');

  it('contains valid SVG favicon in public/favicon.svg', () => {
    const faviconPath = resolve(root, 'public/favicon.svg');
    expect(existsSync(faviconPath)).toBe(true);
    const content = readFileSync(faviconPath, 'utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('viewBox="0 0 512 512"');
  });

  function checkPngDimensions(filePath: string, expectedWidth: number, expectedHeight: number) {
    expect(existsSync(filePath)).toBe(true);
    const buf = readFileSync(filePath);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(expectedWidth);
    expect(height).toBe(expectedHeight);
  }

  it('generates valid 192x192 PNG for standard PWA icon', () => {
    checkPngDimensions(resolve(root, 'public/pwa-192x192.png'), 192, 192);
  });

  it('generates valid 512x512 PNG for high-res PWA icon', () => {
    checkPngDimensions(resolve(root, 'public/pwa-512x512.png'), 512, 512);
  });

  it('generates valid 180x180 PNG for Apple Touch icon', () => {
    checkPngDimensions(resolve(root, 'public/apple-touch-icon.png'), 180, 180);
  });

  it('generates valid 512x512 PNG for maskable icon', () => {
    checkPngDimensions(resolve(root, 'public/maskable-icon-512x512.png'), 512, 512);
  });

  it('index.html contains all required PWA meta tags and viewport settings', () => {
    const htmlPath = resolve(root, 'index.html');
    const html = readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('viewport-fit=cover');
    expect(html).toContain('name="theme-color" content="#090d16"');
    expect(html).toContain('<title>swsswwssswww | Sound Wave Super Synthesizer (for WatanabeShinichiro)</title>');
    expect(html).toContain('swsswwssswww');
    expect(html).toContain('WatanabeShinichiro');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('rel="icon" type="image/svg+xml" href="/favicon.svg"');
  });

  it('vite.config.ts contains updated PWA manifest metadata', () => {
    const viteConfigPath = resolve(root, 'vite.config.ts');
    const config = readFileSync(viteConfigPath, 'utf-8');
    expect(config).toContain("name: 'swsswwssswww - Sound Wave Super Synthesizer (for WatanabeShinichiro)'");
    expect(config).toContain("short_name: 'swsswwssswww'");
    expect(config).toContain("description: 'Sound Wave Super Synthesizer — Waveform Workflow, Signal Sequencing Studio — World Wide Web (for WatanabeShinichiro)'");
  });
});
