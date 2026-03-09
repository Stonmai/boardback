const ua = navigator.userAgent;
const g = globalThis as any;

export const browser = {
  vivaldi: ua.includes('Vivaldi') || !!(g.chrome?.vivaldi ?? g.window?.chrome?.vivaldi),
  chrome: !!(g.chrome ?? g.window?.chrome) && !ua.includes('Edg') && !ua.includes('OPR') && !ua.includes('Vivaldi'),
  edge: ua.includes('Edg'),
  opera: ua.includes('OPR'),
  firefox: ua.includes('Firefox'),
  safari: ua.includes('Safari') && !ua.includes('Chrome'),
};
