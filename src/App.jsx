import React, { useEffect, useMemo, useState } from 'react'
import { dictionaries } from './i18n'
import {
  loadSettings,
  saveSettings,
} from './storage'

const Home = React.lazy(() => import('./components/Home'))
const ListEditor = React.lazy(() => import('./components/ListEditor'))
const Quiz = React.lazy(() => import('./components/Quiz'))
const Flashcards = React.lazy(() => import('./components/Flashcards'))

export default function App() {
  const [settings, setSettings] = useState(() => loadSettings())
  const [route, setRoute] = useState({ view: 'home', listId: null, mode: null })

  const t = useMemo(() => dictionaries[settings.lang] || dictionaries.nl, [settings.lang])

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.lang = settings.lang
    document.documentElement.dataset.theme = settings.theme
  }, [settings])

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      const [view, listId, mode] = hash.split('/')
      if (view === 'list' && listId) setRoute({ view: 'list', listId, mode: mode || 'edit' })
      else if (view === 'quiz' && listId) setRoute({ view: 'quiz', listId, mode: mode || 'typing' })
      else if (view === 'flashcards' && listId) setRoute({ view: 'flashcards', listId })
      else setRoute({ view: 'home', listId: null, mode: null })
    }
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (view, listId = null, mode = null) => {
    const parts = [view]
    if (listId) parts.push(listId)
    if (mode) parts.push(mode)
    window.location.hash = `/${parts.join('/')}`
  }

  const toggleTheme = () =>
    setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))

  const setLang = (lang) => setSettings((s) => ({ ...s, lang }))

  return (
    <div className="app">
      <header className="header">
        <button className="brand" onClick={() => navigate('home')} aria-label={t.appName}>
          <span className="brand-logo">O</span>
          <span className="brand-name">{t.appName}</span>
        </button>
        <div className="header-actions">
          <select
            className="lang-select"
            value={settings.lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label={t.settings.language}
          >
            <option value="nl">NL</option>
            <option value="en">EN</option>
          </select>
          <button className="icon-btn" onClick={toggleTheme} aria-label={t.settings.theme}>
            {settings.theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <main className="main">
        <React.Suspense fallback={<div className="loading">…</div>}>
          {route.view === 'home' && <Home t={t} navigate={navigate} />}
          {route.view === 'list' && (
            <ListEditor t={t} navigate={navigate} listId={route.listId} />
          )}
          {route.view === 'quiz' && (
            <Quiz t={t} navigate={navigate} listId={route.listId} mode={route.mode} />
          )}
          {route.view === 'flashcards' && (
            <Flashcards t={t} navigate={navigate} listId={route.listId} />
          )}
        </React.Suspense>
      </main>
      <footer className="footer">{t.tagline}</footer>
    </div>
  )
}
