'use client'
import { motion, Variants } from 'framer-motion'
import SurveyCard from './SurveyCard'

interface Survey {
  id: string
  title: string
  code: string
  is_active: boolean
  created_at: string
}

interface Props {
  surveys: Survey[]
  origin: string
  countMap: Record<string, number>
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function AnimatedCardList({ surveys, origin, countMap }: Props) {
  return (
    <motion.div className="grid gap-4" variants={container} initial="hidden" animate="show">
      {surveys.map(survey => (
        <motion.div key={survey.id} variants={item}>
          <SurveyCard
            survey={survey}
            origin={origin}
            responseCount={countMap[survey.id] ?? 0}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
