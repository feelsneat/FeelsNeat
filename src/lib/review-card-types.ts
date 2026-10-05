export const REVIEW_CARD_STATUS = [
  'NEW',
  'DESIGN_REVIEW',
  'APPROVED',
  'PRINTED',
  'PACKED',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;

export const REVIEW_CARD_MATERIALS = ['WHITE_PAPER', 'TRANSPARENT'] as const;

export type ReviewCardStatus = (typeof REVIEW_CARD_STATUS)[number];
export type ReviewCardMaterial = (typeof REVIEW_CARD_MATERIALS)[number];

export interface ReviewCardPrintRun {
  id: string;
  printedAt: string;
  copies: number;
  material: ReviewCardMaterial;
  stickerText: string;
  stickerSvg: string;
  reprintOf?: string;
}

export interface ReviewCardOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ReviewCardStatus;
  source?: 'ONLINE' | 'WALK_IN';
  businessName: string;
  googleReviewUrl: string;
  quantity: number;
  material: ReviewCardMaterial;
  stickerText: string;
  logoDataUrl: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  deliveryAddress: string;
  notes: string;
  adminNotes: string;
  approvedStickerSvg: string;
  approvedStickerAt: string;
  printRuns: ReviewCardPrintRun[];
}
