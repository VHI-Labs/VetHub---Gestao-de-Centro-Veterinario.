import { vi } from 'vitest'

// ── Supabase chain builders ─────────────────────────────────

/**
 * Build a self-referencing thenable Supabase chain.
 * All methods return `this` so you can chain `.select().eq().order()`.
 * Awaiting resolves to `{ data: resolvedData, error: null }`.
 */
export function makeChain<T = unknown>(resolvedData: T = [] as unknown as T) {
  const p = Promise.resolve({ data: resolvedData, error: null })
  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    like: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    match: vi.fn(() => chain),
    not: vi.fn(() => chain),
    in: vi.fn(() => chain),
    contains: vi.fn(() => chain),
    containedBy: vi.fn(() => chain),
    overlaps: vi.fn(() => chain),
    filter: vi.fn(() => chain),
    textSearch: vi.fn(() => chain),
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  }
  return chain
}

/**
 * Build an error chain – awaiting resolves to `{ data: null, error: Error }`.
 * All methods return `this` for chaining.
 */
export function makeErrorChain(msg = 'Err') {
  const p = Promise.resolve({ data: null, error: new Error(msg) })
  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    neq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    like: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    match: vi.fn(() => chain),
    not: vi.fn(() => chain),
    in: vi.fn(() => chain),
    contains: vi.fn(() => chain),
    containedBy: vi.fn(() => chain),
    overlaps: vi.fn(() => chain),
    filter: vi.fn(() => chain),
    textSearch: vi.fn(() => chain),
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  }
  return chain
}

/**
 * Build a chain for Supabase count queries (`{ count: 'exact', head: true }`).
 * Awaiting resolves to `{ count, data: null, error: null }`.
 */
export function makeCountChain(count: number) {
  const p = Promise.resolve({ count, data: null, error: null })
  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    like: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    match: vi.fn(() => chain),
    not: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  }
  return chain
}

// ── Legacy (kept for backward compatibility) ────────────────

/** Mock Supabase client for testing (non-thenable) */
export function createMockSupabase() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
  }
}

/** Mock localStorage for testing */
export function mockLocalStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
}
