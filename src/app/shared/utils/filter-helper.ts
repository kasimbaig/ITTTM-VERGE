export function filterData<T>(
  data: T[],
  searchText: string,
  fields: (keyof T)[]
): T[] {
  const search = searchText.toLowerCase().trim();

  if (!search) {
    return [...data]; // Reset if empty search
  }

  return data.filter((item) =>
    fields.some((field) => String(item[field]).toLowerCase().includes(search))
  );
}

export function resetFilterCards(
  cards: any[],
  labelToExclude: string,
  extraResetRef: any[]
): void {
  cards.forEach((card) => {
    card.selectedOption = null;
    if (card.label !== labelToExclude) {
      card.options = [];
    }
  });
  extraResetRef.length = 0; // resets the array
}

// utils/date-utils.ts
export function formatDate(dateString: string): string {
  return dateString ? new Date(dateString).toISOString().split('T')[0] : '';
}
