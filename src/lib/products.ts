export interface DigitalProduct {
  id: string;
  category: 'notion' | 'trackers' | 'resumes';
  title: string;
  price: string;
  features: string[];
  mockupText: string;
  etsyUrl: string;
}

export const PRODUCTS: DigitalProduct[] = [
  // Notion templates
  {
    id: 'creator-os',
    category: 'notion',
    title: 'Creator OS',
    price: '$29.00',
    features: [
      'Visual Workspace Manager',
      'Content Planning Pipeline',
      'Asset Library & Repository',
      'Revenue & Sponsorship Tracker'
    ],
    mockupText: 'Notion Framework: Creator OS',
    etsyUrl: 'https://feelsneat.etsy.com'
  },
  {
    id: 'star-interview',
    category: 'notion',
    title: 'STAR Interview Prep Dashboard',
    price: '$19.00',
    features: [
      'STAR Framework Database',
      'Situation/Task/Action/Result organizer',
      '40+ Practice Behavior Prompts',
      'Interview Tracker & Logbook'
    ],
    mockupText: 'STAR Prep Dashboard Mockup',
    etsyUrl: 'https://feelsneat.etsy.com'
  },
  // Trackers (Google Sheets)
  {
    id: 'side-hustle-budget',
    category: 'trackers',
    title: 'Dynamic Side Hustle Budget Sheet',
    price: '$15.00',
    features: [
      'Automated Expense Charting',
      'Visual Profit & Loss Graphs',
      'Etsy & Stripe Invoice Import Log',
      'Multi-currency Conversion Engine'
    ],
    mockupText: 'Google Sheets Tracker Layout',
    etsyUrl: 'https://feelsneat.etsy.com'
  },
  // Resumes
  {
    id: 'ats-tech-resume',
    category: 'resumes',
    title: 'ATS-Friendly Tech Resume Template',
    price: '$12.00',
    features: [
      'ATS Scanner Optimized Formatting',
      'Modern Single-Page Layout Grid',
      'Action Verb Sentence Builders',
      'LaTeX / PDF Export Guide'
    ],
    mockupText: 'ATS Tech Resume Preview',
    etsyUrl: 'https://feelsneat.etsy.com'
  }
];
