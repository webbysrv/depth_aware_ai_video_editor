import { VideoEditor } from '@/components/VideoEditor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative overflow-hidden bg-background">
      {/* Subtle Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#ff6432]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-5xl flex flex-col items-center mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white mb-6">
          Lumina Sense <span className="font-serif italic text-white/50">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-white/40 max-w-2xl font-light tracking-wide leading-relaxed">
          Real-time, zero-cost, depth-aware compositing entirely in the browser using WebGPU and React Three Fiber.
        </p>
      </div>

      <div className="z-10 w-full max-w-5xl">
        <VideoEditor />
      </div>
    </main>
  );
}
