export const BENCHMARKS = {
  enps: 20,
  engagement: 3.8,
  management: 3.9,
  growth: 3.5,
  balance: 3.6,
}

export const BENCHMARK_LABELS: Record<string, string> = {
  enps: 'eNPS',
  engagement: 'Вовлечённость',
  management: 'Руководство',
  growth: 'Развитие',
  balance: 'Баланс',
}

export function getScoreColor(score: number, benchmark: number, isNPS = false): string {
  if (isNPS) {
    if (score >= benchmark + 10) return 'text-emerald-600'
    if (score >= benchmark - 10) return 'text-amber-600'
    return 'text-rose-600'
  }
  if (score >= benchmark + 0.3) return 'text-emerald-600'
  if (score >= benchmark - 0.3) return 'text-amber-600'
  return 'text-rose-600'
}

export function getScoreBg(score: number, benchmark: number, isNPS = false): string {
  if (isNPS) {
    if (score >= benchmark + 10) return 'bg-emerald-50 border-emerald-200'
    if (score >= benchmark - 10) return 'bg-amber-50 border-amber-200'
    return 'bg-rose-50 border-rose-200'
  }
  if (score >= benchmark + 0.3) return 'bg-emerald-50 border-emerald-200'
  if (score >= benchmark - 0.3) return 'bg-amber-50 border-amber-200'
  return 'bg-rose-50 border-rose-200'
}
