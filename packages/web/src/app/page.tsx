import Canvas from '@/components/Canvas';
import OfflineBanner from '@/components/OfflineBanner';
import ThemeApplier from '@/components/ThemeApplier';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <ThemeApplier />
      <Canvas />
      <OfflineBanner />
    </main>
  );
}
