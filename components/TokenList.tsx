'use client';

import React, { useEffect, useState, useMemo } from 'react';

const TOKENS_API = '/api/tokens';

export interface TokenItem {
  assetId: string;
  decimals: number;
  blockchain: string;
  symbol: string;
  price: number;
  priceUpdatedAt: string;
  contractAddress?: string;
}

type SortKey = 'symbol' | 'blockchain' | 'price' | 'contractAddress';
type SortDir = 'asc' | 'desc';

export default function TokenList() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const res = await fetch(TOKENS_API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TokenItem[] = await res.json();
        setTokens(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    }
    fetchTokens();
  }, []);

  const sortedTokens = useMemo(() => {
    const arr = [...tokens];
    arr.sort((a, b) => {
      let va: string | number = a[sortKey] ?? '';
      let vb: string | number = b[sortKey] ?? '';
      if (sortKey === 'price') {
        const c = a.price - b.price;
        return sortDir === 'asc' ? c : -c;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      const c = sa.localeCompare(sb, undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? c : -c;
    });
    return arr;
  }, [tokens, sortKey, sortDir]);

  if (loading) {
    return (
      <div className="text-zinc-400 py-12 text-center">
        Loading tokens…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 py-12 text-center">
        Error: {error}
      </div>
    );
  }

  const formatPrice = (p: number) =>
    p >= 1 ? p.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.toFixed(8);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({
    label,
    columnKey,
    alignRight,
  }: {
    label: string;
    columnKey: SortKey;
    alignRight?: boolean;
  }) => (
    <th
      className={`px-4 py-3 font-medium text-zinc-300 cursor-pointer select-none hover:text-white hover:bg-zinc-800/50 transition-colors ${alignRight ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(columnKey)}
    >
      <span className={`inline-flex items-center gap-1 ${alignRight ? 'justify-end w-full' : ''}`}>
        {label}
        {sortKey === columnKey && (
          <span className="text-[#CC4420]" aria-hidden>{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded border border-zinc-700">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-700 bg-zinc-900/50">
            <SortHeader label="Symbol" columnKey="symbol" />
            <SortHeader label="Blockchain" columnKey="blockchain" />
            <SortHeader label="Price (USD)" columnKey="price" alignRight />
            <SortHeader label="Contract" columnKey="contractAddress" />
          </tr>
        </thead>
        <tbody>
          {sortedTokens.slice(0, 50).map((t) => (
            <tr key={t.assetId} className="border-b border-zinc-800 hover:bg-zinc-800/30">
              <td className="px-4 py-3">
                <span className="font-medium text-white">{t.symbol}</span>
              </td>
              <td className="px-4 py-3 text-zinc-400">{t.blockchain}</td>
              <td className="px-4 py-3 text-right text-zinc-300">
                ${formatPrice(t.price)}
              </td>
              <td className="px-4 py-3 text-zinc-500 font-mono text-xs max-w-[220px]">
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  {t.contractAddress && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(t.contractAddress!);
                          setCopiedId(t.assetId);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="shrink-0 p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        title="Copy address"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline-block">
                          <rect x="5" y="5" width="9" height="9" rx="1" />
                          <rect x="2" y="2" width="9" height="9" rx="1" />
                        </svg>
                      </button>
                      {copiedId === t.assetId && (
                        <span className="shrink-0 text-[#CC4420] text-xs">Copied</span>
                      )}
                    </>
                  )}
                  <span className="truncate block" title={t.contractAddress ?? undefined}>
                    {t.contractAddress || '—'}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tokens.length > 50 && (
        <p className="px-4 py-2 text-zinc-500 text-xs">
          Showing 50 of {tokens.length} tokens
        </p>
      )}
    </div>
  );
}
