import React, { useEffect, useState } from 'react'
import {
  exportList,
  loadLists,
  newListId,
  saveLists,
} from '../storage'

export default function ListEditor({ t, navigate, listId }) {
  const isNew = listId === 'new'
  const [name, setName] = useState('')
  const [rows, setRows] = useState([{ term: '', definition: '' }, { term: '', definition: '' }])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isNew) {
      setName('')
      setRows([{ term: '', definition: '' }, { term: '', definition: '' }])
      setLoaded(true)
      return
    }
    const list = loadLists().find((l) => l.id === listId)
    if (list) {
      setName(list.name)
      setRows(list.items.length ? list.items.map((i) => ({ ...i })) : [{ term: '', definition: '' }])
    }
    setLoaded(true)
  }, [listId, isNew])

  if (!loaded) return null

  const setRow = (index, field, value) => {
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  const addRow = () => setRows((rs) => [...rs, { term: '', definition: '' }])

  const removeRow = (index) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((_, i) => i !== index) : rs))

  const handleSave = () => {
    const items = rows
      .map((r) => ({ term: r.term.trim(), definition: r.definition.trim() }))
      .filter((r) => r.term && r.definition)
    const trimmedName = name.trim() || t.list.newListTitle
    const lists = loadLists()
    if (isNew) {
      const list = { id: newListId(), name: trimmedName, items }
      saveLists([...lists, list])
    } else {
      saveLists(lists.map((l) => (l.id === listId ? { ...l, name: trimmedName, items } : l)))
    }
    navigate('home')
  }

  return (
    <div className="page">
      <button className="link" onClick={() => navigate('home')}>
        {t.list.backToLists}
      </button>
      <h1>{isNew ? t.list.newListTitle : t.list.editList}</h1>
      <input
        className="input title-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.list.listTitlePlaceholder}
        maxLength={80}
      />
      <div className="editor-rows">
        {rows.map((row, i) => (
          <div className="editor-row" key={i}>
            <span className="row-number">{i + 1}</span>
            <input
              className="input"
              value={row.term}
              onChange={(e) => setRow(i, 'term', e.target.value)}
              placeholder={t.list.term}
              aria-label={`${t.list.term} ${i + 1}`}
            />
            <input
              className="input"
              value={row.definition}
              onChange={(e) => setRow(i, 'definition', e.target.value)}
              placeholder={t.list.definition}
              aria-label={`${t.list.definition} ${i + 1}`}
            />
            <button className="icon-btn danger" onClick={() => removeRow(i)} aria-label="×">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="editor-actions">
        <button className="btn" onClick={addRow}>
          + {t.list.addRow}
        </button>
      </div>
      <div className="editor-actions save-bar">
        <button className="btn primary" onClick={handleSave}>
          {t.list.save}
        </button>
        <button className="btn ghost" onClick={() => navigate('home')}>
          {t.list.cancel}
        </button>
        {!isNew && (
          <button
            className="btn ghost"
            onClick={() => {
              const list = { id: listId, name: name.trim() || t.list.newListTitle, items: rows.filter((r) => r.term.trim() && r.definition.trim()) }
              exportList(list)
            }}
          >
            {t.share.export}
          </button>
        )}
      </div>
    </div>
  )
}
