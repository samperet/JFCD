// Fixed roster — login is by tapping a name (no passwords; minimum-security demo PWA).
export const USERS = [
  { id: 'Jaya', name: 'Jaya', style: 'thumbs', seed: 'jaya_user', accent: '#FF6B6B' },
  { id: 'Fiona', name: 'Fiona', style: 'thumbs', seed: 'fiona_user', accent: '#4ECDC4' },
  { id: 'Lucy', name: 'Lucy', style: 'thumbs', seed: 'lucy_user', accent: '#FFD166' },
  { id: 'Cece', name: 'Cece', style: 'thumbs', seed: 'cece_user', accent: '#06D6A0' },
];

export const USER_IDS = USERS.map((u) => u.id);

// DiceBear avatar styles offered in the picker.
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
