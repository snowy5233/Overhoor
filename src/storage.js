const LIST_KEY = 'overhoor-lists'
const PROGRESS_KEY = 'overhoor-progress'
const SETTINGS_KEY = 'overhoor-settings'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function loadLists() {
  const lists = readJson(LIST_KEY, [])
  return Array.isArray(lists) ? lists : []
}

export function saveLists(lists) {
  localStorage.setItem(LIST_KEY, JSON.stringify(lists))
}

export function loadProgress() {
  const progress = readJson(PROGRESS_KEY, {})
  return progress && typeof progress === 'object' ? progress : {}
}

export function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function loadSettings() {
  const defaults = { lang: 'nl', theme: 'light' }
  const settings = readJson(SETTINGS_KEY, defaults)
  return { ...defaults, ...settings }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function newListId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function updateListProgress(progress, listId, results) {
  const next = { ...progress }
  const listProgress = next[listId] || { correct: 0, wrong: 0, bestStreak: 0, lastScore: null, updatedAt: null }
  const streak = results.reduce((acc, r) => (r.correct ? acc + 1 : 0), 0)
  next[listId] = {
    correct: listProgress.correct + results.filter((r) => r.correct).length,
    wrong: listProgress.wrong + results.filter((r) => !r.correct).length,
    bestStreak: Math.max(listProgress.bestStreak, streak),
    lastScore: results.length
      ? Math.round((results.filter((r) => r.correct).length / results.length) * 100)
      : null,
    updatedAt: Date.now(),
  }
  return next
}

export function getListProgress(progress, listId) {
  const p = progress[listId]
  if (!p) return { correct: 0, wrong: 0, bestStreak: 0, lastScore: null, updatedAt: null }
  return p
}

export function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

export function answersMatch(given, expected) {
  return normalizeAnswer(given) === normalizeAnswer(expected)
}

export function exportList(list) {
  const data = { app: 'overhoor', version: 1, list }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${list.name.replace(/[^a-z0-9\-_]+/gi, '_')}.overhoor.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importListFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const list = data.app === 'overhoor' && data.list ? data.list : data
        if (!list || typeof list.name !== 'string' || !Array.isArray(list.items)) {
          reject(new Error('invalid'))
          return
        }
        list.items = list.items
          .filter((item) => item && typeof item.term === 'string' && typeof item.definition === 'string')
          .map((item) => ({ term: item.term, definition: item.definition }))
        list.id = newListId()
        resolve(list)
      } catch {
        reject(new Error('invalid'))
      }
    }
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsText(file)
  })
}
