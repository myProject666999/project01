import { useAuth } from './useAuth'

const { authHeaders } = useAuth()

async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...options.headers,
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  return res.json()
}

export async function getBooks() {
  return apiFetch('/api/books')
}

export async function getBook(id: string) {
  return apiFetch(`/api/books/${id}`)
}

export async function getPages(bookId: string) {
  return apiFetch(`/api/books/${bookId}/pages`)
}

export async function getPage(bookId: string, pageId: string) {
  return apiFetch(`/api/books/${bookId}/pages/${pageId}`)
}

export async function claimPage(bookId: string, pageId: string) {
  return apiFetch(`/api/books/${bookId}/pages/${pageId}/claim`, { method: 'POST' })
}

export async function releasePage(bookId: string, pageId: string) {
  return apiFetch(`/api/books/${bookId}/pages/${pageId}/release`, { method: 'POST' })
}

export async function saveProofreading(bookId: string, pageId: string, proofreadingId: string, textContent: string) {
  return apiFetch(`/api/books/${bookId}/pages/${pageId}/proofreadings/${proofreadingId}`, {
    method: 'PUT',
    body: JSON.stringify({ textContent }),
  })
}

export async function submitProofreading(bookId: string, pageId: string, proofreadingId: string, textContent: string) {
  return apiFetch(`/api/books/${bookId}/pages/${pageId}/proofreadings/${proofreadingId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ textContent }),
  })
}

export async function getReview(bookId: string, pageId: string) {
  return apiFetch(`/api/books/${bookId}/pages/${pageId}/review`)
}

export async function finalizeReview(bookId: string, pageId: string, finalText: string) {
  return apiFetch(`/api/books/${bookId}/pages/${pageId}/review/finalize`, {
    method: 'POST',
    body: JSON.stringify({ finalText }),
  })
}

export async function getDictionaries() {
  return apiFetch('/api/dictionaries')
}

export async function getDictionaryEntries(dictId: string, search?: string) {
  const url = search
    ? `/api/dictionaries/${dictId}/entries?search=${encodeURIComponent(search)}`
    : `/api/dictionaries/${dictId}/entries`
  return apiFetch(url)
}

export async function lookupDictionary(char: string) {
  return apiFetch(`/api/dictionaries/lookup?char=${encodeURIComponent(char)}`)
}

export async function addDictionaryEntry(dictId: string, entry: any) {
  return apiFetch(`/api/dictionaries/${dictId}/entries`, {
    method: 'POST',
    body: JSON.stringify(entry),
  })
}

export async function updateDictionaryEntry(dictId: string, entryId: string, entry: any) {
  return apiFetch(`/api/dictionaries/${dictId}/entries/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  })
}

export async function deleteDictionaryEntry(dictId: string, entryId: string) {
  return apiFetch(`/api/dictionaries/${dictId}/entries/${entryId}`, { method: 'DELETE' })
}
