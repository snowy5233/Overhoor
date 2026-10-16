import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  answersMatch,
  getListProgress,
  loadLists,
  loadProgress,
  saveProgress,
  updateListProgress,
} from '../storage'

function buildQuestions(list, t) {
  const items = list.items.map((item, index) => ({ ...item, index }))
  const ask = (item, dir) => ({
    index: item.index,
    prompt: dir === 'def' ? item.definition : item.term,
    answer: dir === 'def' ? item.term : item.definition,
  })
  return items.flatMap((item) => {
    const dirs = item.direction === 'def' ? ['def'] : item.direction === 'term' ? ['term'] : ['term', 'def']
    return dirs.map((dir) => ask(item, dir))
  })
}

export default function Quiz({ t, navigate, listId }) {
  const [list, setList] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState(null)
  const [results, setResults] = useState([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const found = loadLists().find((l) => l.id === listId)
    setList(found || null)
  }, [listId])

  const start = (shuffle = true) => {
    if (!list) return
    let qs = buildQuestions(list)
    if (shuffle) qs = [...qs].sort(() => Math.random() - 0.5)
    setQuestions(qs)
    setCurrent(0)
    setInput('')
    setChecked(null)
    setResults([])
    setStreak(0)
    setBestStreak(0)
    setFinished(false)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (list) start(true)
  }, [list])

  const question = questions[current]

  const check = () => {
    if (!question || checked !== null) return
    const correct = answersMatch(input, question.answer)
    setChecked(correct)
    setResults((r) => [...r, { correct }])
    setStreak((s) => {
      const next = correct ? s + 1 : 0
      setBestStreak((b) => Math.max(b, next))
      return next
    })
  }

  const next = () => {
    if (current + 1 >= questions.length) {
      const finalResults = [...results]
      const progress = updateListProgress(loadProgress(), listId, finalResults)
      saveProgress(progress)
      setFinished(true)
      return
    }
    setCurrent((c) => c + 1)
    setInput('')
    setChecked(null)
    inputRef.current?.focus()
  }

  if (!list) {
    return (
      <div className="page">
        <button className="link" onClick={() => navigate('home')}>{t.list.backToLists}</button>
        <p className="empty-title">{t.quiz.emptyList}</p>
      </div>
    )
  }

  if (list.items.length === 0) {
    return (
      <div className="page">
        <button className="link" onClick={() => navigate('home')}>{t.list.backToLists}</button>
        <p className="empty-title">{t.quiz.emptyList}</p>
        <button className="btn" onClick={() => navigate('list', listId)}>{t.list.editList}</button>
      </div>
    )
  }

  if (finished) {
    const total = results.length
    const correct = results.filter((r) => r.correct).length
    const pct = total ? Math.round((correct / total) * 100) : 0
    const p = getListProgress(loadProgress(), listId)
    return (
      <div className="page center">
        <h1>{t.quiz.results}</h1>
        <div className="score-ring">
          <span className="score-pct">{pct}%</span>
        </div>
        <p className="score-line">
          {correct} {t.quiz.correctAnswers} · {total - correct} {t.quiz.wrongAnswers}
        </p>
        <p className="score-line">
          {t.quiz.streakBest}: {bestStreak}
        </p>
        <div className="hero-actions">
          <button className="btn primary" onClick={() => start(true)}>{t.quiz.again}</button>
          <button className="btn" onClick={() => navigate('home')}>{t.quiz.back}</button>
          <button className="btn ghost" onClick={() => navigate('flashcards', listId)}>
            {t.home.flashcards}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="quiz-top">
        <button className="link" onClick={() => navigate('home')}>{t.list.backToLists}</button>
        <span className="badge">{current + 1} / {questions.length}</span>
      </div>
      <h2 className="quiz-question-label">{t.quiz.question}</h2>
      <div className="quiz-card">
        <p className="quiz-prompt">{question.prompt}</p>
        {checked === null ? (
          <div className="quiz-input-row">
            <input
              ref={inputRef}
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (checked === null ? check() : next())}
              placeholder={t.quiz.yourAnswer}
              aria-label={t.quiz.yourAnswer}
              autoFocus
            />
            <button className="btn primary" onClick={check}>{t.quiz.check}</button>
          </div>
        ) : (
          <div className="quiz-feedback">
            <p className={checked ? 'feedback correct' : 'feedback wrong'}>
              {checked ? t.quiz.correct : t.quiz.wrong}
            </p>
            {!checked && (
              <p className="answer-was">
                {t.quiz.answerWas} <strong>{question.answer}</strong>
              </p>
            )}
            <button className="btn primary" onClick={next} autoFocus>
              {current + 1 >= questions.length ? t.quiz.finish : t.quiz.next}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
