import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-secondary rounded-full opacity-20 blur-[100px]"></div>

      <div className="z-10 text-center max-w-md w-full">
        <h1 className="text-6xl font-bold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-2xl">
          PULSAR
        </h1>
        <p className="text-subtext mb-8 text-sm uppercase tracking-[0.3em]">
          Master Your Frequency
        </p>

        <div className="bg-surface border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl mb-8">
          <h2 className="text-2xl font-semibold mb-3">FUOYE 100L Prep</h2>
          <p className="text-sm text-subtext mb-6">
            Ace GST 101, BIO 101, MTH 101 and more.
          </p>
          
          <button className="block w-full py-4 bg-primary text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(160,108,213,0.4)]">
            Start Practice Free 🚀
          </button>
        </div>
      </div>
    </main>
  );
          }
