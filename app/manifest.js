const icon = (size) =>
  `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'><rect fill='%230a7bff' width='${size}' height='${size}' rx='${size * 0.22}'/><text x='50%25' y='52%25' font-size='${size * 0.5}' font-weight='800' font-family='-apple-system,sans-serif' dominant-baseline='middle' text-anchor='middle' fill='white'>J</text></svg>`;

export default function manifest() {
  return {
    name: 'JFCD — Group Chat',
    short_name: 'JFCD',
    description: 'A secure iOS-style group chat PWA',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#000000',
    theme_color: '#0a7bff',
    categories: ['social', 'productivity'],
    icons: [
      { src: icon(192), sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: icon(512), sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
