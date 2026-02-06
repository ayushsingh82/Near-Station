'use client';

import React, { useMemo, useState } from 'react';
import type {
  TokenListSchema,
  TokenListEntry,
  SupportedPair,
} from '@/types/tokenlist';
import { isGroupedEntry, isFlatEntry } from '@/types/tokenlist';

// Load token list: use full tokenlist.json if present, else schema subset
const TOKENLIST_PATH = '/data/tokenlist.json';

function collectPairs(entries: TokenListEntry[]): SupportedPair[] {
  const pairs: SupportedPair[] = [];
  for (const entry of entries) {
    if (isGroupedEntry(entry)) {
      for (const gt of entry.groupedTokens) {
        for (const d of gt.deployments) {
          pairs.push({
            symbol: gt.symbol,
            name: gt.name,
            chainName: d.chainName,
            defuseAssetId: gt.defuseAssetId,
            decimals: d.decimals,
            address: d.address,
            type: d.type,
            bridge: d.bridge,
            originChainName: gt.originChainName,
          });
        }
      }
    } else if (isFlatEntry(entry)) {
        for (const d of entry.deployments) {
        pairs.push({
          symbol: entry.symbol,
          name: entry.name,
          chainName: d.chainName,
          defuseAssetId: entry.defuseAssetId,
          decimals: d.decimals,
          address: d.address,
          type: d.type,
          bridge: d.bridge,
          originChainName: entry.originChainName,
        });
      }
    }
  }
  return pairs;
}

function getUniqueTokens(entries: TokenListEntry[]): { symbol: string; label: string }[] {
  const seen = new Set<string>();
  const out: { symbol: string; label: string }[] = [];
  for (const entry of entries) {
    const symbol = isGroupedEntry(entry) ? entry.symbol : entry.symbol;
    const name = isGroupedEntry(entry) ? entry.name : entry.name;
    if (seen.has(symbol)) continue;
    seen.add(symbol);
    out.push({ symbol, label: `${symbol} (${name})` });
  }
  out.sort((a, b) => a.symbol.localeCompare(b.symbol));
  return out;
}

function getUniqueChains(pairs: SupportedPair[]): string[] {
  const set = new Set(pairs.map((p) => p.chainName));
  return Array.from(set).sort();
}

const CHAIN_TO_CANONICAL: Record<string, string> = {
  solana: 'sol',
  sol: 'sol',
  ethereum: 'eth',
  eth: 'eth',
  'near protocol': 'near',
  near: 'near',
};

function toCanonicalChain(name: string): string {
  const lower = (name || '').toLowerCase().trim();
  return CHAIN_TO_CANONICAL[lower] ?? lower;
}

function chainNamesForLookup(canonical: string): string[] {
  const c = canonical.toLowerCase();
  const expanded: Record<string, string[]> = {
    sol: ['sol', 'solana'],
    eth: ['eth', 'ethereum'],
    near: ['near', 'near protocol'],
  };
  return expanded[c] ?? [c];
}

export default function TokenChainExplorer() {
  const [schema, setSchema] = useState<TokenListSchema | null>(null);
  const [apiTokens, setApiTokens] = useState<{ symbol: string; blockchain: string; contractAddress?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceChain, setSourceChain] = useState<string>('');
  const [sourceToken, setSourceToken] = useState<string>('');
  const [destChain, setDestChain] = useState<string>('');
  const [destToken, setDestToken] = useState<string>('');

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [listRes, apiRes] = await Promise.all([
          fetch(TOKENLIST_PATH),
          fetch('/api/tokens'),
        ]);
        if (!listRes.ok) {
          if (listRes.status === 404) {
            const schemaRes = await fetch('/data/tokenlist.schema.json');
            if (!schemaRes.ok) throw new Error('Token list not found');
            const data: TokenListSchema = await schemaRes.json();
            if (!cancelled) setSchema(data);
          } else throw new Error(`HTTP ${listRes.status}`);
        } else {
          const data: TokenListSchema = await listRes.json();
          if (!cancelled) setSchema(data);
        }
        if (!cancelled && apiRes.ok) {
          const apiList: { symbol: string; blockchain: string; contractAddress?: string }[] = await apiRes.json();
          if (Array.isArray(apiList)) setApiTokens(apiList);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load token list');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const [showFinal, setShowFinal] = useState(false);

  const { tokens, pairs, allChains } = useMemo(() => {
    const fromSchema = schema?.tokens?.length
      ? getUniqueTokens(schema.tokens)
      : [];
    const fromApi = apiTokens
      .filter((t) => t.symbol)
      .map((t) => ({ symbol: t.symbol, label: t.symbol }));
    const seen = new Set<string>();
    const merged: { symbol: string; label: string }[] = [];
    for (const t of fromSchema) {
      if (!seen.has(t.symbol)) {
        seen.add(t.symbol);
        merged.push(t);
      }
    }
    for (const t of fromApi) {
      if (!seen.has(t.symbol)) {
        seen.add(t.symbol);
        merged.push(t);
      }
    }
    merged.sort((a, b) => a.symbol.localeCompare(b.symbol));
    const pairs = schema?.tokens?.length ? collectPairs(schema.tokens) : [];
    const chainsFromSchema = getUniqueChains(pairs);
    const chainsFromApi = apiTokens
      .map((t) => t.blockchain)
      .filter((c): c is string => Boolean(c));
    const allChainsSet = new Set<string>();
    for (const c of chainsFromSchema) {
      allChainsSet.add(toCanonicalChain(c));
    }
    for (const c of chainsFromApi) {
      allChainsSet.add(toCanonicalChain(c));
    }
    const allChains = Array.from(allChainsSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    return { tokens: merged, pairs, allChains };
  }, [schema, apiTokens]);

  const sourceChains = useMemo(
    () => (sourceToken ? allChains : []),
    [allChains, sourceToken]
  );
  const destChains = useMemo(
    () => (destToken ? allChains : []),
    [allChains, destToken]
  );

  const chainMatches = (apiChain: string, selectedChain: string): boolean => {
    const a = (apiChain || '').toLowerCase();
    const b = (selectedChain || '').toLowerCase();
    if (a === b) return true;
    const aliases: Record<string, string[]> = {
      eth: ['ethereum'],
      solana: ['sol'],
      near: ['near protocol'],
    };
    for (const [k, vals] of Object.entries(aliases)) {
      if ((a === k || vals.includes(a)) && (b === k || vals.includes(b))) return true;
    }
    return false;
  };

  const getAddress = (symbol: string, chainName: string): string => {
    const sym = (symbol || '').toUpperCase();
    const chainAliases = chainNamesForLookup(chainName);
    const p = pairs.find(
      (x) =>
        x.symbol.toUpperCase() === sym &&
        chainAliases.includes(x.chainName.toLowerCase())
    );
    if (p) return p.type === 'native' ? 'native' : p.address ?? '';
    const fromApi = apiTokens.find(
      (t) =>
        (t.symbol || '').toUpperCase() === sym &&
        chainMatches(t.blockchain, chainName) &&
        t.contractAddress
    );
    return fromApi?.contractAddress ?? '';
  };

  const sourceAddress = getAddress(sourceToken, sourceChain);
  const destAddress = getAddress(destToken, destChain);
  const canShowFinal =
    sourceToken && sourceChain && destToken && destChain;
  const showAddresses = showFinal && canShowFinal;

  if (loading) {
    return (
      <div className="text-zinc-400 py-8 text-center">
        Loading token list…
      </div>
    );
  }
  if (error || !schema) {
    return (
      <div className="text-red-400 py-8 text-center">
        {error || 'Token list not available'}
      </div>
    );
  }

  const selectClass = 'w-full bg-[#0A0A0A] border border-zinc-600 rounded px-3 py-2 text-white focus:border-[#CC4420] focus:outline-none';
  const labelClass = 'block text-xs font-medium text-zinc-400 mb-1';

  const handleSourceTokenChange = (symbol: string) => {
    setSourceToken(symbol);
    setSourceChain('');
    setShowFinal(false);
  };
  const handleSourceChainChange = (chain: string) => {
    setSourceChain(chain);
    setShowFinal(false);
  };
  const handleDestTokenChange = (symbol: string) => {
    setDestToken(symbol);
    setDestChain('');
    setShowFinal(false);
  };
  const handleDestChainChange = (chain: string) => {
    setDestChain(chain);
    setShowFinal(false);
  };

  const copySvg = (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="inline-block">
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <rect x="2" y="2" width="9" height="9" rx="1" />
    </svg>
  );

  return (
    <div className="rounded border border-zinc-700 bg-zinc-900/30 p-5 space-y-5">
      <div className="flex flex-wrap gap-8">
        <div className="min-w-[220px]">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Source</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>1. Token</label>
              <select
                value={sourceToken}
                onChange={(e) => handleSourceTokenChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Select token</option>
                {tokens.map((t) => (
                  <option key={t.symbol} value={t.symbol}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>2. Chain</label>
              <select
                value={sourceChain}
                onChange={(e) => handleSourceChainChange(e.target.value)}
                className={selectClass}
                disabled={!sourceToken}
              >
                <option value="">
                  {sourceToken ? 'Select chain' : 'Select token first'}
                </option>
                {sourceChains.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="min-w-[220px]">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Destination</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>1. Token</label>
              <select
                value={destToken}
                onChange={(e) => handleDestTokenChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Select token</option>
                {tokens.map((t) => (
                  <option key={t.symbol} value={t.symbol}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>2. Chain</label>
              <select
                value={destChain}
                onChange={(e) => handleDestChainChange(e.target.value)}
                className={selectClass}
                disabled={!destToken}
              >
                <option value="">
                  {destToken ? 'Select chain' : 'Select token first'}
                </option>
                {destChains.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {canShowFinal && (
        <div className="pt-2 border-t border-zinc-700 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFinal(true)}
            className="px-4 py-2 rounded bg-[#CC4420] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Final
          </button>
          <button
            type="button"
            onClick={() => {
              setSourceToken('');
              setSourceChain('');
              setDestToken('');
              setDestChain('');
              setShowFinal(false);
            }}
            className="px-4 py-2 rounded border border-zinc-600 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {showAddresses && (
        <div className="pt-4 border-t border-zinc-700 space-y-3">
          <h3 className="text-sm font-medium text-zinc-300">Addresses</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-zinc-700 bg-[#0A0A0A]/50 p-3">
              <p className="text-xs text-zinc-500 mb-1">Source</p>
              <p className={`font-mono text-sm break-all ${sourceAddress ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {sourceAddress || 'Not available'}
              </p>
              {sourceAddress ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(sourceAddress)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#CC4420] hover:underline"
                >
                  {copySvg}
                  Copy
                </button>
              ) : (
                <p className="mt-1 text-xs text-zinc-500">
                  {sourceToken} on {sourceChain} not in list
                </p>
              )}
            </div>
            <div className="rounded border border-zinc-700 bg-[#0A0A0A]/50 p-3">
              <p className="text-xs text-zinc-500 mb-1">Destination</p>
              <p className={`font-mono text-sm break-all ${destAddress ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {destAddress || 'Not available'}
              </p>
              {destAddress ? (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(destAddress)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#CC4420] hover:underline"
                >
                  {copySvg}
                  Copy
                </button>
              ) : (
                <p className="mt-1 text-xs text-zinc-500">
                  {destToken} on {destChain} not in list
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
