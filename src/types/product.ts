export type Country =
  | "au"
  | "bx"
  | "be"
  | "ca"
  | "xf"
  | "cn"
  | "de"
  | "es"
  | "fr"
  | "hk"
  | "hz"
  | "ie"
  | "it"
  | "jp"
  | "nl"
  | "nz"
  | "at"
  | "pl"
  | "sg"
  | "kr"
  | "cx"
  | "ch"
  | "tw"
  | "uk"
  | "us";

export type Category =
  | "iPad"
  | "iPhone"
  | "MacBook Air"
  | "MacBook Pro"
  | "iMac"
  | "Mac Mini"
  | "Mac Studio"
  | "Mac Pro"
  | "Apple Watch"
  | "Apple TV"
  | "HomePod"
  | "Displays"
  | "Accessories"
  | "Other";

export interface Product {
  id: string; // stable hash: title + pubDate + link
  country: Country;
  rawTitle: string;
  title: string; // cleaned display title
  category: Category;
  price: number;
  currency: "NZD";
  publishedAt: string; // ISO string
  link: string; // Apple Store product link
  imageUrl?: string;
  sku?: string;

  // Parsed specs (optional)
  chip?: string; // M1/M2/M3/M4, S8/S9/S10, A15/A16/A17
  ramGB?: number;
  storageGB?: number;
  sizeInch?: number;
  network?: "Wi-Fi" | "Cellular";
  color?: string;

  specsText?: string; // plain text specs summary
}
