import React, { createContext, useCallback, useContext, useState } from 'react';
import { FIELDS, RANKS } from './data';
import { freshState, Post, State } from './store';
import { TERMS_VERSION } from './terms';

/** デモ版の入り口の画面（登録画面の初期表示）。デモ用ボタンが書き換える */
export const demoNav = { step: 'choose' as 'choose' | 'new' | 'login' };

type Ctx = { nonce: number; bump: () => void };
const DemoCtx = createContext<Ctx>({ nonce: 0, bump: () => {} });
export const useDemo = () => useContext(DemoCtx);

/** nonce が変わると、アプリの画面を作り直す（開いていた画面を最初にもどすため） */
export function DemoProvider({ children }: { children: (nonce: number) => React.ReactNode }) {
  const [nonce, setNonce] = useState(0);
  const bump = useCallback(() => setNonce((n) => n + 1), []);
  return <DemoCtx.Provider value={{ nonce, bump }}>{children(nonce)}</DemoCtx.Provider>;
}

const DAY = 86400000;

// 調査の足あと用の見本店（岡山駅の周辺。実在の店ではありません）
const SPOTS: { n: string; g: string; dish: string; price: number; lat: number; lng: number; sat: number; days: number }[] = [
  { n: 'デモ店 豚骨亭', g: '豚骨', dish: '豚骨ラーメン', price: 900, lat: 34.6655, lng: 133.919, sat: 4, days: 9 },
  { n: 'デモ店 醤油屋', g: '醤油', dish: '中華そば', price: 850, lat: 34.6612, lng: 133.9227, sat: 5, days: 5 },
  { n: 'デモ店 家系道場', g: '家系', dish: '家系ラーメン', price: 950, lat: 34.6689, lng: 133.9301, sat: 4, days: 2 },
];

/** 「ログイン後」の状態を、階級（0=見習い … 5=特別監察官）ごとに作る */
export function demoState(rank: number): State {
  const base = freshState();
  const now = Date.now();
  const at = RANKS[rank].at;
  const palette = { ...base.palette };
  FIELDS.forEach((f) => { if (f.rank <= rank) palette[f.k] = true; });
  const posts: Post[] = SPOTS.map((s, i) => ({
    id: 1000 + i, venue: `demo-${i + 1}`, venueName: s.n, lat: s.lat, lng: s.lng, genre: s.g, dish: s.dish, sat: s.sat,
    vals: { price: String(s.price), soup: s.g, amount: 'ちょうどよい', toppings: '味玉', note: 'デモ用の記録です。' },
    weather: null, enteredAt: now - s.days * DAY, first: true, pts: 64, rouletteId: null, t: now - s.days * DAY, edits: [],
  }));
  return {
    ...base,
    uid: 'IKI-DEMO',
    onboarded: true,
    account: null,
    profile: { nickname: 'デモ調査官', nationality: '日本', gender: '', age: '', allergies: '', favorites: ['豚骨', '醤油'], rich: 3, thick: '中', ntype: 'ストレート', toppings: ['味玉', 'チャーシュー'] },
    terms: { version: TERMS_VERSION, at: now, synced: true },
    pt: at,
    trust: rank >= 5 ? 85 : 50 + rank * 6,
    posts,
    visited: posts.map((p) => p.venue),
    ledger: [{ n: at, r: 'デモ用の開始ポイント', t: now }],
    palette,
  };
}

// ---- 他の調査官の評価（デモ用の見本。サーバには接続しない）----
const mask = (need: number, rank: number, v: any) => (rank < need ? { masked: true, reason: 'rank', need_rank: need } : v);
const RANK_NAMES = ['見習い', '三級インスペクター', '二級インスペクター', '一級インスペクター', '主任インスペクター'];

/** shop_reviews（サーバ）と同じ形の見本を返す。階級が足りない項目は黒塗り */
export function demoReviews(rank: number, sort: string) {
  const mk = (i: number) => {
    const g = (need: number, v: any) => mask(need, rank, v);
    return {
      id: `demo-r${i}`,
      date: new Date(Date.now() - (i * 3 + 1) * DAY).toISOString().slice(0, 10),
      reviewer: { rank_name: RANK_NAMES[i % 5], trust: 60 + i * 5 },
      dish: ['豚骨ラーメン', '醤油ラーメン', '家系ラーメン', '味噌ラーメン', '塩ラーメン'][i % 5],
      satisfaction: 70 + ((i * 7) % 30),
      photos: null,
      price: g(0, { price_yen: 850 + i * 30 }),
      volume: g(0, { volume: ['just_right', 'more', 'less', 'just_right', 'more'][i % 5] }),
      soup: g(0, { soup: ['豚骨', '醤油', '家系', '味噌', '塩'][i % 5] }),
      toppings: g(0, { toppings: '味玉,チャーシュー' }),
      kaedama: g(0, { kaedama: i % 2 === 0 }),
      note: g(0, { comment: 'デモ用の見本の感想です。スープが濃厚でした。' }),
      rec: g(0, { would_return: true, would_recommend: i % 2 === 0 }),
      party: g(1, { party_size: 1 + (i % 3) }),
      mood: g(1, { mood: 'good' }),
      condition: g(1, { hunger_before: 70, fullness_after: 85 }),
      quiet: g(1, { quietness: 2 }),
      wait: g(1, { wait_min: 5 + i * 3 }),
      clean: g(1, { entrance: 0, seating: 0, tableware: 1, restroom: 0, kitchen: 0 }),
      noodle: g(1, { richness: 3, noodle_thick: '中', noodle_firm: '固め', noodle_type: 'ストレート' }),
      items: g(1, { base_items: 'チャーシュー,ネギ,メンマ', sides: null }),
      taste: g(2, { sweet: 2, salty: 3, sour: 1, bitter: 0, umami: 4, hot: 1 }),
      service: g(2, { service: 3, serve_speed_min: 4 }),
      quality: g(3, { aroma: 0, texture: 0, temperature: 1, presentation: 0 }),
      facility: g(3, { crowdedness: 1, payment_methods: 'cash,ic', smoking: 'no', seat_types: 'counter,table' }),
      noise: g(4, { noise_db: 68 }),
      extra: g(4, { mood_tags: 'solo', is_pick: i === 0, tax_included: true }),
      corrections: rank >= 4 ? [] : mask(4, rank, []),
    };
  };
  const limit = rank === 0 ? 5 : 8;
  const items = Array.from({ length: limit }, (_, i) => mk(i));
  if (sort === 'low') items.sort((a, b) => a.satisfaction - b.satisfaction);
  if (sort === 'high') items.sort((a, b) => b.satisfaction - a.satisfaction);
  if (sort === 'cheap') items.sort((a, b) => (a.price as any).price_yen - (b.price as any).price_yen);
  return {
    scope: rank === 0 ? 'basic' : rank <= 2 ? '30days' : 'all',
    limit,
    total: 12,
    shown: limit,
    viewer_rank: rank,
    summary: {
      n: 12,
      satisfaction: mask(0, rank, { avg: 82 }),
      price: mask(0, rank, { avg: 920 }),
      wait: mask(1, rank, { avg: 12 }),
      quiet: mask(1, rank, { avg: 2 }),
      taste: mask(2, rank, { sweet: 2, salty: 3, sour: 1, bitter: 0, umami: 4, hot: 1 }),
    },
    items,
  };
}
