import { BRAND, REPOSITORY_URL } from "./site-config";
export const site = {
  name: BRAND.name,
  nameKo: BRAND.nameKo,
  tagline: BRAND.tagline,
  email: 'biwoom.ol@gmail.com',
  github: REPOSITORY_URL,
  licenseGuide: '/pages/cc0/',
} as const;
