export interface Document {
  id: string;
  content: string;
  title: string;
  snippet: string;
  themeId: string;
  direction: 'auto' | 'rtl' | 'ltr';
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
}
