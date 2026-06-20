// The four built-in accounts. The roster is dynamic at runtime (stored in
// localStorage) — anyone can register by typing a name — but these always
// seed a fresh device so there's someone to talk to.
export const SEED_USERS = [
  { name: 'Jaya', style: 'thumbs', seed: 'jaya_user' },
  { name: 'Fiona', style: 'thumbs', seed: 'fiona_user' },
  { name: 'Lucy', style: 'thumbs', seed: 'lucy_user' },
  { name: 'Cece', style: 'thumbs', seed: 'cece_user' },
];

// DiceBear avatar styles offered in the picker (and used for new sign-ups).
export const AVATAR_STYLES = [
  'thumbs',
  'avataaars',
  'big-ears',
  'big-smile',
  'bottts',
  'croodles',
  'fun-emoji',
  'lorelei',
  'micah',
  'miniavs',
  'notionists',
  'open-peeps',
  'personas',
  'pixel-art',
  'adventurer',
  'adventurer-neutral',
];

export function avatarUrl(style, seed) {
  const s = style || 'thumbs';
  const sd = seed || 'jfcd';
  return `https://api.dicebear.com/10.x/${s}/svg?bodyProbability=100&seed=${encodeURIComponent(sd)}`;
}

// A random avatar style for a freshly-registered account.
export function randomStyle() {
  return AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
}

// Normalize a typed name into a stable display name (and account key).
export function cleanName(raw) {
  return (raw || '').trim().replace(/\s+/g, ' ').slice(0, 24);
}
