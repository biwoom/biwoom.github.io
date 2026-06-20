export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: '/', label: 'HOME' },
  { href: '/text', label: 'TEXT' },
  { href: '/story', label: 'STORY' },
  { href: '/design', label: 'DESIGN' },
  { href: '/net', label: 'NET' },
];
