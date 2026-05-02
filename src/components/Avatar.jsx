import { useState } from 'react';

/**
 * Derives a deterministic hue (0–359) from a string via a simple hash.
 * Same name always produces the same hue.
 */
function nameToHue(name) {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 360;
}

/**
 * Extracts initials from a name string.
 * Takes the first letter of each word, up to a maximum of 2 characters.
 */
function getInitials(name) {
  if (!name || !name.trim()) return '?';
  const words = name.trim().split(/\s+/);
  const initials = words
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return initials || '?';
}

/**
 * Avatar component that attempts to load an image from `src`.
 * On load error (or when no src is provided), falls back to a colored
 * placeholder showing the user's initials derived from `name`.
 *
 * Props:
 *   src       — optional image URL
 *   name      — string used for initials and deterministic background color
 *   size      — diameter in pixels (default: 40)
 *   className — optional extra CSS classes
 */
const Avatar = ({ src, name = '', size = 40, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const showFallback = !src || imgError;
  const initials = getInitials(name);
  const hue = nameToHue(name);
  const bgColor = `hsl(${hue}, 55%, 45%)`;

  const style = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
  };

  if (showFallback) {
    return (
      <div
        className={`flex items-center justify-center select-none font-semibold text-white ${className}`}
        style={{
          ...style,
          backgroundColor: bgColor,
          fontSize: Math.max(10, Math.floor(size * 0.38)),
        }}
        aria-label={name || 'Avatar'}
        role="img"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'Avatar'}
      className={`object-cover ${className}`}
      style={style}
      onError={() => setImgError(true)}
    />
  );
};

export default Avatar;
export { getInitials, nameToHue };
