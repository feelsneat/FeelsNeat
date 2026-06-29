import * as Icons from 'lucide-react';

interface LucideIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  className?: string;
  size?: number | string;
}

export function LucideIcon({ name, className, size, ...props }: LucideIconProps) {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    // Fallback icon if not found
    const HelpCircle = Icons.HelpCircle;
    return <HelpCircle className={className} size={size} {...props} />;
  }
  return <IconComponent className={className} size={size} {...props} />;
}
