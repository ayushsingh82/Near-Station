import Navbar from '@/components/Navbar';
import TokenList from '@/components/TokenList';
import TokenChainExplorer from '@/components/TokenChainExplorer';
import Link from 'next/link';

export default function Intents() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0A0A0A] text-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 font-serif">
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3 tracking-tight">
              Token & chain explorer
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Check supported token–chain pairs and live prices. Token list and price data from{' '}
              <a
                href="https://1click.chaindefuser.com/v0/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#CC4420] hover:underline"
              >
                1click.chaindefuser.com
              </a>
              .
            </p>
          </header>

          <section className="mb-10">
            <TokenChainExplorer />
          </section>

          <section className="font-serif">
            <TokenList />
          </section>

          <div className="mt-10 pt-6 border-t border-zinc-800">
            <Link
              href="/"
              className="text-[#CC4420] hover:underline text-sm"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
