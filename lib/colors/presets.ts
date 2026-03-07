import type { ColorTheme, ColorPreset } from '@/types/colors';
import { DEFAULT_CLASSIC_THEME } from './defaults';

const PRESET_THEMES: Record<string, ColorTheme> = {
  classic: { ...DEFAULT_CLASSIC_THEME },
  ocean: {
    primaryText: '#0C4A6E', secondaryText: '#0369A1', link: '#0EA5E9', code: '#0EA5E9',
    h1: '#0C4A6E', h1Border: '#0EA5E9', h2: '#0C4A6E', h2Border: '#38BDF8', h3: '#0369A1',
    previewBg: '#FFFFFF', codeBg: '#0F172A', blockquoteBg: '#F0F9FF',
    tableHeader: '#0EA5E9', tableAlt: '#F0F9FF', blockquoteBorder: '#0EA5E9',
    hr: '#0EA5E9', tableBorder: '#BAE6FD',
  },
  forest: {
    primaryText: '#14532D', secondaryText: '#15803D', link: '#22C55E', code: '#22C55E',
    h1: '#14532D', h1Border: '#22C55E', h2: '#14532D', h2Border: '#4ADE80', h3: '#15803D',
    previewBg: '#FFFFFF', codeBg: '#0F1A14', blockquoteBg: '#F0FDF4',
    tableHeader: '#22C55E', tableAlt: '#DCFCE7', blockquoteBorder: '#22C55E',
    hr: '#22C55E', tableBorder: '#BBF7D0',
  },
  sunset: {
    primaryText: '#7C2D12', secondaryText: '#C2410C', link: '#F97316', code: '#F97316',
    h1: '#7C2D12', h1Border: '#F97316', h2: '#7C2D12', h2Border: '#FB923C', h3: '#C2410C',
    previewBg: '#FFFBEB', codeBg: '#1C1917', blockquoteBg: '#FFF7ED',
    tableHeader: '#F97316', tableAlt: '#FFEDD5', blockquoteBorder: '#F97316',
    hr: '#F97316', tableBorder: '#FED7AA',
  },
  mono: {
    primaryText: '#1F2937', secondaryText: '#4B5563', link: '#6B7280', code: '#374151',
    h1: '#111827', h1Border: '#6B7280', h2: '#1F2937', h2Border: '#9CA3AF', h3: '#374151',
    previewBg: '#FFFFFF', codeBg: '#111827', blockquoteBg: '#F9FAFB',
    tableHeader: '#4B5563', tableAlt: '#F3F4F6', blockquoteBorder: '#6B7280',
    hr: '#6B7280', tableBorder: '#E5E7EB',
  },
  lavender: {
    primaryText: '#4C1D95', secondaryText: '#6D28D9', link: '#8B5CF6', code: '#8B5CF6',
    h1: '#4C1D95', h1Border: '#8B5CF6', h2: '#4C1D95', h2Border: '#A78BFA', h3: '#6D28D9',
    previewBg: '#FAFAFE', codeBg: '#1E1B4B', blockquoteBg: '#F5F3FF',
    tableHeader: '#8B5CF6', tableAlt: '#EDE9FE', blockquoteBorder: '#8B5CF6',
    hr: '#8B5CF6', tableBorder: '#DDD6FE',
  },
  rose: {
    primaryText: '#881337', secondaryText: '#BE123C', link: '#F43F5E', code: '#F43F5E',
    h1: '#881337', h1Border: '#F43F5E', h2: '#881337', h2Border: '#FB7185', h3: '#BE123C',
    previewBg: '#FFF1F2', codeBg: '#1C1917', blockquoteBg: '#FFF1F2',
    tableHeader: '#F43F5E', tableAlt: '#FFE4E6', blockquoteBorder: '#F43F5E',
    hr: '#F43F5E', tableBorder: '#FECDD3',
  },
  gold: {
    primaryText: '#78350F', secondaryText: '#B45309', link: '#F59E0B', code: '#D97706',
    h1: '#78350F', h1Border: '#F59E0B', h2: '#78350F', h2Border: '#FBBF24', h3: '#B45309',
    previewBg: '#FFFBEB', codeBg: '#1C1917', blockquoteBg: '#FEF3C7',
    tableHeader: '#F59E0B', tableAlt: '#FEF3C7', blockquoteBorder: '#F59E0B',
    hr: '#F59E0B', tableBorder: '#FDE68A',
  },
  teal: {
    primaryText: '#134E4A', secondaryText: '#0F766E', link: '#14B8A6', code: '#14B8A6',
    h1: '#134E4A', h1Border: '#14B8A6', h2: '#134E4A', h2Border: '#2DD4BF', h3: '#0F766E',
    previewBg: '#FFFFFF', codeBg: '#0F1A1A', blockquoteBg: '#F0FDFA',
    tableHeader: '#14B8A6', tableAlt: '#CCFBF1', blockquoteBorder: '#14B8A6',
    hr: '#14B8A6', tableBorder: '#99F6E4',
  },
  night: {
    primaryText: '#E2E8F0', secondaryText: '#94A3B8', link: '#60A5FA', code: '#60A5FA',
    h1: '#F1F5F9', h1Border: '#3B82F6', h2: '#E2E8F0', h2Border: '#60A5FA', h3: '#CBD5E1',
    previewBg: '#0F172A', codeBg: '#020617', blockquoteBg: '#1E293B',
    tableHeader: '#334155', tableAlt: '#1E293B', blockquoteBorder: '#3B82F6',
    hr: '#3B82F6', tableBorder: '#334155',
  },
  ruby: {
    primaryText: '#1A1A1A', secondaryText: '#3D3D3D', link: '#E10514', code: '#E10514',
    h1: '#1A1A1A', h1Border: '#E10514', h2: '#3D3D3D', h2Border: '#E10514', h3: '#6B6B6B',
    previewBg: '#F8F6F3', codeBg: '#1A1A1A', blockquoteBg: '#F0EDE8',
    tableHeader: '#E10514', tableAlt: '#F0EDE8', blockquoteBorder: '#E10514',
    hr: '#E10514', tableBorder: '#E5E0DA',
  },
  sakura: {
    primaryText: '#4A2040', secondaryText: '#6B3A5D', link: '#E891B2', code: '#D4729A',
    h1: '#4A2040', h1Border: '#E891B2', h2: '#6B3A5D', h2Border: '#F0B4CC', h3: '#8B5A7E',
    previewBg: '#FFF5F8', codeBg: '#2D1526', blockquoteBg: '#FCEEF3',
    tableHeader: '#D4729A', tableAlt: '#FCEEF3', blockquoteBorder: '#E891B2',
    hr: '#E891B2', tableBorder: '#F5D5E2',
  },
  mint: {
    primaryText: '#1B3A36', secondaryText: '#2D5F58', link: '#4FD1C5', code: '#38B2AC',
    h1: '#1B3A36', h1Border: '#4FD1C5', h2: '#2D5F58', h2Border: '#81E6D9', h3: '#388F86',
    previewBg: '#F0FFFD', codeBg: '#0F2624', blockquoteBg: '#E6FFFA',
    tableHeader: '#38B2AC', tableAlt: '#E6FFFA', blockquoteBorder: '#4FD1C5',
    hr: '#4FD1C5', tableBorder: '#B2F5EA',
  },
  coffee: {
    primaryText: '#3E2723', secondaryText: '#5D4037', link: '#A1887F', code: '#8D6E63',
    h1: '#3E2723', h1Border: '#8D6E63', h2: '#5D4037', h2Border: '#BCAAA4', h3: '#6D4C41',
    previewBg: '#FBF8F5', codeBg: '#2C1E1A', blockquoteBg: '#EFEBE9',
    tableHeader: '#6D4C41', tableAlt: '#EFEBE9', blockquoteBorder: '#8D6E63',
    hr: '#A1887F', tableBorder: '#D7CCC8',
  },
  sky: {
    primaryText: '#1E3A5F', secondaryText: '#2C5282', link: '#63B3ED', code: '#4299E1',
    h1: '#1E3A5F', h1Border: '#63B3ED', h2: '#2C5282', h2Border: '#90CDF4', h3: '#3182CE',
    previewBg: '#F7FBFF', codeBg: '#1A2A3E', blockquoteBg: '#EBF8FF',
    tableHeader: '#4299E1', tableAlt: '#EBF8FF', blockquoteBorder: '#63B3ED',
    hr: '#63B3ED', tableBorder: '#BEE3F8',
  },
};

const PRESET_HEBREW_NAMES: Record<string, string> = {
  classic: 'קלאסי', ocean: 'אוקיינוס', forest: 'יער', sunset: 'שקיעה',
  mono: 'מונוכרום', lavender: 'לבנדר', rose: 'ורוד', gold: 'זהב',
  teal: 'טיל', night: 'לילה', ruby: 'רובי', sakura: 'סקורה',
  mint: 'מנטה', coffee: 'קפה', sky: 'שמיים',
};

export const COLOR_PRESETS: ColorPreset[] = Object.entries(PRESET_THEMES).map(
  ([name, theme]) => ({ name, hebrewName: PRESET_HEBREW_NAMES[name], theme })
);

export const COLOR_PRESET_MAP: Record<string, ColorTheme> = PRESET_THEMES;
