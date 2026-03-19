import Canvas from '@/components/Canvas';
import OfflineBanner from '@/components/OfflineBanner';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Canvas />
      <OfflineBanner />
    </main>
  );
}
