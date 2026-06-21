export interface Profile {
  id: string
  email: string
  company_name: string
  created_at: string
}

export interface Survey {
  id: string
  owner_id: string
  code: string
  title: string
  is_active: boolean
  created_at: string
}

export interface SurveyResponse {
  id: string
  survey_id: string
  q1: number
  q2: number
  q3: number
  q4: number
  q5: number
  q6: number
  q7: number
  q8: number
  q9: number
  q10: number
  q11: number
  q12: number
  q13: number
  q14: number
  q15: number
  q16: number
  q17: number
  q18: number
  q19: number
  comment: string | null
  created_at: string
}

export interface Metrics {
  responseCount: number
  companyNPS: number
  managerNPS: number
  promotersPercent: number
  passivesPercent: number
  detractorsPercent: number
  managerPromotersPercent: number
  managerPassivesPercent: number
  managerDetractorsPercent: number
  engagement: number
  management: number
  growth: number
  balance: number
  motivation: {
    salary: number
    recognition: number
    development: number
    stability: number
    team: number
    autonomy: number
  }
  comments: string[]
}

export type FormAnswers = {
  [key: string]: number | string | null
}
