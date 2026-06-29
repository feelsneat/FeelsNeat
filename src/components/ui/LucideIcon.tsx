import { 
  X, Menu, Link, Feather, ArrowRight, ArrowUpRight, ExternalLink, BookOpen, 
  Briefcase, Cpu, Paintbrush, Code, ArrowLeft, Globe, 
  Settings, FileText, Bookmark, Check, AlertCircle, AlertTriangle, ShieldAlert, Trash2, Mail, HelpCircle
} from 'lucide-react';

interface LucideIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  className?: string;
  size?: number | string;
}

const iconsMap: Record<string, React.ComponentType<any>> = {
  X, Menu, Link, Feather, ArrowRight, ArrowUpRight, ExternalLink, BookOpen, 
  Briefcase, Cpu, Paintbrush, Code, ArrowLeft, Globe, 
  Settings, FileText, Bookmark, Check, AlertCircle, AlertTriangle, ShieldAlert, Trash2, Mail, HelpCircle
};

// Custom SVG components for brand/social icons absent in this version of lucide-react
function TwitterIcon({ className, ...props }: any) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" className={className} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ className, ...props }: any) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className, ...props }: any) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className, ...props }: any) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

const customBrandIcons: Record<string, React.ComponentType<any>> = {
  Twitter: TwitterIcon,
  Github: GithubIcon,
  Linkedin: LinkedinIcon,
  Youtube: YoutubeIcon
};

export function LucideIcon({ name, className, size, ...props }: LucideIconProps) {
  const normalized = name.trim();
  
  // 1. Resolve from custom brand icons first
  const BrandComponent = customBrandIcons[normalized];
  if (BrandComponent) {
    return <BrandComponent className={className} style={{ fontSize: size }} {...props} />;
  }

  // 2. Resolve from mapped Lucide icons list
  const IconComponent = iconsMap[normalized];
  if (!IconComponent) {
    const Fallback = iconsMap.HelpCircle;
    return <Fallback className={className} size={size} {...props} />;
  }
  
  return <IconComponent className={className} size={size} {...props} />;
}
