interface AvatarProps {
  src?: string | null;
  /** Used for the alt text and, when there's no image, the initials fallback. */
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** Renders the user's profile image, or their initials when no image is set. */
export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizeClasses = SIZE_CLASSES[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-medium text-primary-700`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
