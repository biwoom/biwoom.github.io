import { url } from "../lib/url";

export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: url("/"), label: "홈" },
  { href: url("/text"), label: "경론" },
  { href: url("/story"), label: "문학" },
];
