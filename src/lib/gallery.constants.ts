export const GALLERY_CATEGORIES = [
  "Schools",
  "Colleges",
  "Clubs",
  "Corporates",
  "Events",
  "Factory",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];
