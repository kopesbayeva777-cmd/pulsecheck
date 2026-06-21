import type { SurveyResponse, Metrics } from '@/types'

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

function calcNPS(scores: number[]): { nps: number; promoters: number; passives: number; detractors: number } {
  if (scores.length === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0 }
  const promoters = scores.filter(s => s >= 9).length
  const passives = scores.filter(s => s >= 7 && s <= 8).length
  const detractors = scores.filter(s => s <= 6).length
  const total = scores.length
  const nps = Math.round(((promoters - detractors) / total) * 100)
  return {
    nps,
    promoters: Math.round((promoters / total) * 100),
    passives: Math.round((passives / total) * 100),
    detractors: Math.round((detractors / total) * 100),
  }
}

export function calculateMetrics(responses: SurveyResponse[]): Metrics {
  if (responses.length === 0) {
    return {
      responseCount: 0,
      companyNPS: 0, managerNPS: 0,
      promotersPercent: 0, passivesPercent: 0, detractorsPercent: 0,
      managerPromotersPercent: 0, managerPassivesPercent: 0, managerDetractorsPercent: 0,
      engagement: 0, management: 0, growth: 0, balance: 0,
      motivation: { salary: 0, recognition: 0, development: 0, stability: 0, team: 0, autonomy: 0 },
      comments: [],
    }
  }

  const companyNPSData = calcNPS(responses.map(r => r.q1))
  const managerNPSData = calcNPS(responses.map(r => r.q2))

  return {
    responseCount: responses.length,
    companyNPS: companyNPSData.nps,
    managerNPS: managerNPSData.nps,
    promotersPercent: companyNPSData.promoters,
    passivesPercent: companyNPSData.passives,
    detractorsPercent: companyNPSData.detractors,
    managerPromotersPercent: managerNPSData.promoters,
    managerPassivesPercent: managerNPSData.passives,
    managerDetractorsPercent: managerNPSData.detractors,
    engagement: avg(responses.flatMap(r => [r.q3, r.q4, r.q5, r.q6])),
    management: avg(responses.flatMap(r => [r.q7, r.q8, r.q9])),
    growth: avg(responses.flatMap(r => [r.q10, r.q11])),
    balance: avg(responses.flatMap(r => [r.q12, r.q13])),
    motivation: {
      salary: avg(responses.map(r => r.q14)),
      recognition: avg(responses.map(r => r.q15)),
      development: avg(responses.map(r => r.q16)),
      stability: avg(responses.map(r => r.q17)),
      team: avg(responses.map(r => r.q18)),
      autonomy: avg(responses.map(r => r.q19)),
    },
    comments: responses
      .map(r => r.comment)
      .filter((c): c is string => Boolean(c && c.trim())),
  }
}
