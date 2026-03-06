/**
 * PoskiREAL API Types
 * XML-RPC API Documentation: https://export-test.poskireal.cz/import/v1/
 */

export interface PoskiCredentials {
  clientId: string;
  passwordMd5: string;
  softwareKey: string;
}

export interface PoskiSession {
  sessionId: string;
  lastUpdated: Date;
}

export interface PoskiAdvertData {
  // Povinná pole
  advert_function: 1 | 2 | 3 | 4; // 1=Prodej, 2=Pronájem, 3=Dražby, 4=Podíly
  advert_lifetime: 1 | 2 | 3 | 4; // 1=7dní, 2=14dní, 3=30dní, 4=90dní
  advert_price: number;
  advert_price_currency: 1 | 2 | 3; // 1=CZK, 2=USD, 3=EUR
  advert_price_unit: 1 | 2 | 3; // 1=za nemovitost, 2=za měsíc, 3=za m2
  advert_type: number; // 1=Byty, 2=Domy, 3=Pozemky, 4=Komerční, 5=Ostatní
  advert_subtype: number; // viz dokumentace číselníků
  title: string;
  description: string;
  locality_region: string; // povinný (kraj)
  locality_city: string;
  locality_street: string;
  locality_accuracy_level: 'OK' | 'OB' | 'MC' | 'CO' | 'UL' | 'AD' | 'SO';
  locality_inaccuracy_level: 1 | 2 | 3; // 1=přesně, 2=o 1 stupeň, 3=o 2 stupně
  seller_id: number; // nebo seller_rkid
  
  // Volitelná pole
  usable_area?: number;
  floor?: number;
  floors?: number;
  rooms?: number;
  construction_year?: number;
  reconstruction_year?: number;
  heating?: string;
  equipment?: string;
  parking?: string;
  balcony?: string;
  garden?: string;
  elevator?: boolean;
  cellar?: boolean;
  garage?: boolean;
  terrace?: boolean;
  loggia?: boolean;
  attic?: boolean;
  energy_rating?: string;
  energy_performance?: string;
  note?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_web?: string;
  
  // Interní ID
  advert_rkid?: string;
}

export interface PoskiPhotoData {
  main: 0 | 1; // 1=hlavní foto, 0=vedlejší
  order: number; // pořadí
  photo_rkid: string; // interní ID
  data: string; // base64_string
  alt?: string; // popisek
}

export interface PoskiVideoData {
  video_rkid: string;
  data: string; // base64_string
  title?: string;
  description?: string;
}

export interface PoskiSellerData {
  seller_id?: number;
  seller_rkid?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  ico?: string;
  dic?: string;
  note?: string;
}

export interface PoskiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PoskiAdvertListResponse {
  adverts: Array<{
    advert_id: number;
    advert_rkid: string;
    title: string;
    status: string;
    created: string;
    updated: string;
  }>;
}

export interface PoskiHashResponse {
  session_id: string;
}

export interface PoskiLoginResponse {
  success: boolean;
  user_id?: number;
  user_name?: string;
}

// Mapování z REALFORGE na PoskiREAL
export interface RealForgeListing {
  id: string;
  title: string;
  address: string;
  type: 'APARTMENT' | 'HOUSE' | 'LAND' | 'COMMERCIAL';
  price: number;
  area?: number;
  rooms?: number;
  floor?: number;
  yearBuilt?: number;
  description?: string;
  aiResult?: {
    headline?: string;
    longDesc?: string;
    shortDesc?: string;
  };
  media?: Array<{
    url: string;
    isFeatured: boolean;
    sortOrder: number;
    originalName: string;
  }>;
}

// Chybové kódy
export enum PoskiErrorCode {
  OK = 200,
  CLIENT_NOT_FOUND = 402,
  BAD_LOGIN = 407,
  INVALID_PARAMS = 452,
  ADDRESS_NOT_FOUND = 453,
  INTERNAL_ERROR = 500
}

// Číselníky
export const PoskiAdvertFunction = {
  SALE: 1, // Prodej
  RENT: 2, // Pronájem
  AUCTION: 3, // Dražby
  SHARES: 4 // Podíly
} as const;

export const PoskiAdvertLifetime = {
  DAYS_7: 1,
  DAYS_14: 2,
  DAYS_30: 3,
  DAYS_90: 4
} as const;

export const PoskiAdvertType = {
  APARTMENT: 1, // Byty
  HOUSE: 2, // Domy
  LAND: 3, // Pozemky
  COMMERCIAL: 4, // Komerční
  OTHER: 5 // Ostatní
} as const;

export const PoskiCurrency = {
  CZK: 1,
  USD: 2,
  EUR: 3
} as const;

export const PoskiPriceUnit = {
  PER_PROPERTY: 1, // za nemovitost
  PER_MONTH: 2, // za měsíc
  PER_SQM: 3 // za m2
} as const;

export const PoskiAccuracyLevel = {
  OK: 'OK', // Obec
  OB: 'OB', // Obvod
  MC: 'MC', // Městská část
  CO: 'CO', // Čtvrť
  UL: 'UL', // Ulice
  AD: 'AD', // Adresa
  SO: 'SO' // Souřadnice
} as const;

export const PoskiInaccuracyLevel = {
  EXACT: 1, // přesně
  ONE_LEVEL: 2, // o 1 stupeň
  TWO_LEVELS: 3 // o 2 stupně
} as const;