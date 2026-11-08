// Conversations: each one keeps its own chat messages. Saved in this browser only.
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sincerecall.conversations.v1'
const TITLE_MAX = 48

export const WELCOME = {
  id: 'welcome',
  role: 'bot',
  kind: 'welcome',
  text: "Describe what you're seeing on site. I'll find similar past situations and what fixed them.",
}

function newConversation() {
  const now = new Date().toISOString()
  return { id: `c-${Date.now()}`, title: null, createdAt: now, updatedAt: now, messages: [WELCOME] }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(saved?.conversations) && saved.conversations.length > 0) return saved
  } catch {
    // storage blocked or corrupt: start fresh
  }
  const first = newConversation()
  return { conversations: [first], activeId: first.id }
}

/** A conversation with only the welcome message has nothing to keep. */
export function isEmpty(conversation) {
  return !conversation.messages.some((m) => m.role === 'user')
}

export function titleOf(conversation) {
  return conversation.title ?? 'New conversation'
}

export function useConversations() {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage full or blocked: keep working in memory
    }
  }, [state])

  const active = state.conversations.find((c) => c.id === state.activeId) ?? state.conversations[0]
  // Most recently used first
  const conversations = [...state.conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  function select(id) {
    setState((s) => ({ ...s, activeId: id }))
  }

  /** Reuses the current conversation if it is still empty, so blanks don't pile up. */
  function create() {
    if (isEmpty(active)) return
    const c = newConversation()
    setState((s) => ({ conversations: [c, ...s.conversations], activeId: c.id }))
  }

  /** Adds the user's text plus a bot message that shows its ranked results. */
  function send(text) {
    const id = Date.now()
    const now = new Date().toISOString()
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id !== active.id
          ? c
          : {
              ...c,
              title: c.title ?? (text.length > TITLE_MAX ? `${text.slice(0, TITLE_MAX - 1)}…` : text),
              updatedAt: now,
              messages: [
                ...c.messages,
                { id, role: 'user', text },
                { id: id + 1, role: 'bot', kind: 'results', query: { description: text } },
              ],
            },
      ),
    }))
  }

  return { conversations, active, select, create, send }
}
