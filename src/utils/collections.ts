interface Identifiable {
  id: string
}

/** Indexes a list by id for O(1) lookups from list rows. */
export function indexById<TItem extends Identifiable>(
  items: readonly TItem[],
): Record<string, TItem> {
  return items.reduce<Record<string, TItem>>((index, item) => {
    index[item.id] = item
    return index
  }, {})
}
