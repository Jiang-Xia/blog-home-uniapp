const inflight = new Map<string, Promise<unknown>>()

export function rpgDedupedGet<T>(key: string, task: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key)
  if (existing)
    return existing as Promise<T>
  const pending = task().finally(() => inflight.delete(key))
  inflight.set(key, pending)
  return pending
}

export function clearRpgInflight(...keys: string[]) {
  for (const key of keys)
    inflight.delete(key)
}

export function clearRpgInflightByPrefix(prefix: string) {
  Array.from(inflight.keys()).forEach((key) => {
    if (key.startsWith(prefix))
      inflight.delete(key)
  })
}

export function afterRpgMutation<T>(keys: string[], task: () => Promise<T>): Promise<T> {
  return task().then((result) => {
    clearRpgInflight(...keys)
    return result
  })
}

export function afterRpgMutationWithPrefixes<T>(
  keys: string[],
  prefixes: string[],
  task: () => Promise<T>,
): Promise<T> {
  return task().then((result) => {
    clearRpgInflight(...keys)
    for (const prefix of prefixes)
      clearRpgInflightByPrefix(prefix)
    return result
  })
}
