import React, { useEffect, useState } from 'react'
import { loadLists } from '../storage'

function shuffledIndices(count) {
  const idx = Array.from({ length: count }, (_, i) => i)
  return idx.sort(() => Math.random() - 0.5)
}

export default function Flashcards({ t, navigate, listId }) {
  const [list, setList] = useState(null)
  const [order, setOrder] = useState(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const found = loadLists().find((l) => l.id === listId)
    setList(found || null)
    setOrder(found ? shuffledIndices(found.items.length) : null)
    setIndex(0)
    setFlipped(false)
    setDone(false)
  }, [listId])

  const start = () => {
    setOrder(shuffledIndices(list.items.length))
    setIndex(0)
    setFlipped(false)
    setDone(false)
  }

  if (!list || !order || list.items.length === 0) {
    return (
      <div className="page">
        <button className="link" onClick={() => navigate('home')}>{t.list.backToLists}</button>
        <p className="empty-title">{t.quiz.emptyList}</p>
        <button className="btn" onClick={() => navigate('list', listId)}>{t.list.editList}</button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="page center">
        <h1>{t.flashcards.title}</h1>
        <p className="empty-title">{t.flashcards.done}</p>
        <div className="hero-actions">
          <button className="btn primary" onClick={start}>{t.flashcards.restart}</button>
          <button className="btn" onClick={() => navigate('home')}>{t.quiz.back}</button>
        </div>
      </div>
    )
  }

  const item = list.items[order[index]]

  if (!item) {
    return <div className="loading">…</div>
  }

  const flip = () => setFlipped((f) => !f)

  const advance = () => {
    if (index + 1 >= order.length) {
      setDone(true)
      return
    }
    setIndex((i) => i + 1)
    setFlipped(false)
  }

  const back = () => {
    setIndex((i) => Math.max(0, i - 1))
    setFlipped(false)
  }

  return (
    <div className="page">
      <div className="quiz-top">
        <button className="link" onClick={() => navigate('home')}>{t.list.backToLists}</button>
        <span className="badge">
          {t.flashcards.cardOf} {index + 1} {t.flashcards.of} {order.length}
        </span>
      </div>
      <h2 className="quiz-question-label">{t.flashcards.title}</h2>
      <button
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={flip}
        aria-label={flipped ? item.definition : item.term}
      >
        <span className="flashcard-label">{flipped ? t.list.definition : t.list.term}</span>
        <span className="flashcard-text">{flipped ? item.definition : item.term}</span>
      </button>
      <div className="hero-actions">
        <button className="btn ghost" onClick={back} disabled={index === 0}>
          {t.flashcards.prev}
        </button>
        <button className="btn" onClick={flip}>{t.flashcards.showAnswer}</button>
        <button className="btn primary" onClick={advance}>{t.flashcards.next}</button>
      </div>
    </div>
  )
}
