import { HOME_URL } from "../lib/site-config";
import { url } from "../lib/url";

export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: HOME_URL, label: "HOME" },
  { href: url("/text"), label: "TEXT" },
  { href: url("/story"), label: "STORY" },
];
