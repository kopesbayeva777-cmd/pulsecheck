export type QuestionType = 'nps' | 'scale' | 'text'

export interface Question {
  id: string
  num: number
  block: string
  text: string
  type: QuestionType
}

export const BLOCKS = {
  enps: 'eNPS',
  engagement: 'Вовлечённость',
  management: 'Руководство',
  growth: 'Развитие',
  balance: 'Баланс',
  motivation: 'Мотивационный профиль',
  open: 'Открытый вопрос',
}

export const QUESTIONS: Question[] = [
  { id: 'q1', num: 1, block: 'enps', type: 'nps', text: 'Насколько вероятно, что вы порекомендуете компанию как место работы своим друзьям или знакомым?' },
  { id: 'q2', num: 2, block: 'enps', type: 'nps', text: 'Насколько вероятно, что вы порекомендуете своего непосредственного руководителя другим?' },
  { id: 'q3', num: 3, block: 'engagement', type: 'scale', text: 'Моя работа имеет смысл — я понимаю, как мой вклад влияет на результат компании.' },
  { id: 'q4', num: 4, block: 'engagement', type: 'scale', text: 'Я чётко понимаю, что от меня ожидают на работе.' },
  { id: 'q5', num: 5, block: 'engagement', type: 'scale', text: 'У меня есть инструменты и ресурсы для качественной работы.' },
  { id: 'q6', num: 6, block: 'engagement', type: 'scale', text: 'Я горжусь тем, что работаю в этой компании.' },
  { id: 'q7', num: 7, block: 'management', type: 'scale', text: 'Мой руководитель заботится обо мне как о человеке.' },
  { id: 'q8', num: 8, block: 'management', type: 'scale', text: 'Мой руководитель даёт обратную связь, которая помогает мне расти.' },
  { id: 'q9', num: 9, block: 'management', type: 'scale', text: 'Решения в компании принимаются справедливо и прозрачно.' },
  { id: 'q10', num: 10, block: 'growth', type: 'scale', text: 'За последний год у меня была возможность учиться и расти.' },
  { id: 'q11', num: 11, block: 'growth', type: 'scale', text: 'Я вижу перспективы карьерного роста в этой компании.' },
  { id: 'q12', num: 12, block: 'balance', type: 'scale', text: 'Моя рабочая нагрузка разумна — я не выгораю.' },
  { id: 'q13', num: 13, block: 'balance', type: 'scale', text: 'Компания уважает моё личное время вне работы.' },
  { id: 'q14', num: 14, block: 'motivation', type: 'scale', text: 'Для меня важно, что зарплата соответствует моему вкладу.' },
  { id: 'q15', num: 15, block: 'motivation', type: 'scale', text: 'Для меня важно публичное признание за хорошую работу.' },
  { id: 'q16', num: 16, block: 'motivation', type: 'scale', text: 'Для меня важно постоянно учиться и развиваться.' },
  { id: 'q17', num: 17, block: 'motivation', type: 'scale', text: 'Для меня важна стабильность — чёткий график, понятные задачи.' },
  { id: 'q18', num: 18, block: 'motivation', type: 'scale', text: 'Для меня важна сильная команда с хорошей атмосферой.' },
  { id: 'q19', num: 19, block: 'motivation', type: 'scale', text: 'Для меня важна автономия — самому решать, как выполнять задачи.' },
  { id: 'q20', num: 20, block: 'open', type: 'text', text: 'Ваши комментарии и идеи — что можно улучшить в работе компании?' },
]

export const SCALE_LABELS: Record<number, string> = {
  1: 'Совершенно не согласен',
  2: 'Не согласен',
  3: 'Нейтрально',
  4: 'Согласен',
  5: 'Полностью согласен',
}
