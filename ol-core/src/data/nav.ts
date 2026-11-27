import { url } from "../lib/url";

export interface NavItem {
  href: string;
  label: string;
}

const cardItem = { href: url("/articles/"), label: "카드" };
const libraryItems: NavItem[] = [
  { href: url("/text"), label: "경론" },
  { href: url("/story"), label: "문학" },
];
export const navItems = [...libraryItems, cardItem];
export const homeNavItems = [cardItem, ...libraryItems];
