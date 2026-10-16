import React, { useRef, useState } from 'react'
import {
  exportList,
  getListProgress,
  importListFile,
  loadLists,
  loadProgress,
  saveLists,
} from '../storage'

export default function Home({ t, navigate }) {
  const [lists, setLists] = useState(loadLists)
  const [progress] = useState(loadProgress)
  const [message, setMessage] = useState(null)
  const fileRef = useRef(null)

  const persist = (next) => {
    setLists(next)
    saveLists(next)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    e.target.value = null
    if (!file) return
    try {
      const list = await importListFile(file)
      const next = [...lists, list]
      persist(next)
      setMessage(t.share.imported)
    } catch {
      setMessage(t.share.importFailed)
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm(t.list.deleteConfirm)) return
    persist(lists.filter((l) => l.id !== id))
  }

  return (
    <div className="page">
      <section className="hero">
        <h1>{t.home.welcome}</h1>
        <p>{t.home.subtitle}</p>
        <div className="hero-actions">
          <button className="btn primary" onClick={() => navigate('list', 'new')}>
            + {t.home.newList}
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            {t.home.importList}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            hidden
          />
        </div>
        {message && <p className="message">{message}</p>}
      </section>

      {lists.length === 0 ? (
        <div className="empty">
          <p className="empty-title">{t.home.noLists}</p>
          <p className="empty-sub">{t.home.noListsSub}</p>
        </div>
      ) : (
        <ul className="list-grid">
          {lists.map((list) => {
            const p = getListProgress(progress, list.id)
            return (
              <li key={list.id} className="list-card">
                <div className="list-card-head">
                  <h3>{list.name}</h3>
                  <span className="badge">
                    {list.items.length} {list.items.length === 1 ? t.home.item : t.home.items}
                  </span>
                </div>
                <div className="list-card-actions">
                  <button className="btn primary" onClick={() => navigate('quiz', list.id)}>
                    {t.home.start}
                  </button>
                  <button className="btn" onClick={() => navigate('flashcards', list.id)}>
                    {t.home.flashcards}
                  </button>
                  <button className="btn ghost" onClick={() => navigate('list', list.id)}>
                    {t.home.edit}
                  </button>
                  <button className="btn ghost" onClick={() => exportList(list)}>
                    {t.share.export}
                  </button>
                  <button className="btn ghost danger" onClick={() => handleDelete(list.id)}>
                    {t.home.delete}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
