import { Timestamp } from 'firebase/firestore';

declare global {
  var __firebase_config: string | undefined;
  var __app_id: string | undefined;
  var __initial_auth_token: string | undefined;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'admin' | 'user';
  joinedAt?: Timestamp | Date;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  score: number | string;
  sentAt: Timestamp | Date;
  status: string;
  gameType?: string;
  reward?: string;
}

export interface GameConfig {
  winScore: number;
  timeLimit: number;
  voucherProbability: number;
  theme: 'default' | 'fruits' | 'sports' | 'animals';
}

export interface HomeConfig {
  title: string;
  subtitle: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  heroImage?: string;
}

export interface AnnouncementConfig {
  text: string;
  active: boolean;
  color: string;
}

export interface AdsConfig {
  active: boolean;
  type: 'image' | 'video';
  url: string;
  link?: string;
}