import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { demoNav, demoState, useDemo } from './demo';
import { RANK_ICON } from './icons';
import { RANKS } from './data';
import { freshState, rankIndexOf, useStore } from './store';
import { C, web } from './theme';

/** 画面の外（欄外）に置く、プレゼン用のデモ操作パネル。押すと、アプリをその状態にして最初の画面にもどす */
export default function DemoPanel({ wide }: { wide: boolean }) {
  const { S, update } = useStore();
  const { bump } = useDemo();
  const cur = S.onboarded ? rankIndexOf(S.pt) : -1;

  const start = (step: 'new' | 'login') => { demoNav.step = step; update(() => freshState()); bump(); };
  const asRank = (i: number) => { update(() => demoState(i)); bump(); };

  const btn = (label: string, onPress: () => void, on = false, sub?: string, icon?: any) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 2,
          borderColor: on ? '#F08A6E' : 'rgba(255,255,255,.25)', backgroundColor: on ? '#8A2A1E' : 'rgba(255,255,255,.06)' },
        wide ? { width: '100%' } : { minWidth: 120 },
      ]}
    >
      {icon ? <Image source={icon} style={{ width: 32, height: 32 }} resizeMode="contain" /> : null}
      <View style={{ flexShrink: 1 }}>
        <Text style={{ color: '#FBF1E4', fontWeight: '800', fontSize: 15 }}>{label}</Text>
        {sub ? <Text style={{ color: '#D9C7B0', fontSize: 11.5 }}>{sub}</Text> : null}
      </View>
    </Pressable>
  );

  const body = (
    <View style={{ gap: 8 }}>
      <Text style={{ color: '#F08A6E', fontWeight: '800', fontSize: 12, letterSpacing: 2 }}>DEMO ／ プレゼン用</Text>
      <Text style={{ color: '#D9C7B0', fontSize: 12, lineHeight: 18 }}>ボタンを押すと、その状態から試せます。データはこのブラウザの中だけで、サーバには送りません。</Text>
      <Text style={{ color: '#FBF1E4', fontWeight: '800', fontSize: 13, marginTop: 6 }}>はじめて</Text>
      <View style={{ gap: 8, flexDirection: wide ? 'column' : 'row', flexWrap: 'wrap' }}>
        {btn('新規登録', () => start('new'), !S.onboarded && demoNav.step === 'new', '登録フォームから')}
        {btn('ログイン', () => start('login'), !S.onboarded && demoNav.step === 'login', '三級でログイン')}
      </View>
      <Text style={{ color: '#FBF1E4', fontWeight: '800', fontSize: 13, marginTop: 6 }}>ログイン後（階級ごと）</Text>
      <View style={{ gap: 8, flexDirection: wide ? 'column' : 'row', flexWrap: 'wrap' }}>
        {RANKS.map((r, i) => btn(r.n.replace('インスペクター', ''), () => asRank(i), cur === i, `${r.at.toLocaleString()}pt〜`, RANK_ICON[i]))}
      </View>
    </View>
  );

  if (wide) {
    return (
      <View style={[{ width: 260, backgroundColor: '#2E2420', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,.12)' }, web({ boxShadow: '-6px 0 18px rgba(0,0,0,.35)' })]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>{body}</ScrollView>
      </View>
    );
  }
  return <View style={{ backgroundColor: '#2E2420', padding: 10, maxHeight: 260 }}><ScrollView>{body}</ScrollView></View>;
}
