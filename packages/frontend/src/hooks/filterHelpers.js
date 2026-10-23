export const SORT_OPTIONS = [
  { id: 'default', label: 'Predeterminado' },
  { id: 'precio_asc', label: 'Precio: menor a mayor' },
  { id: 'precio_desc', label: 'Precio: mayor a menor' },
  { id: 'fecha_asc', label: 'Fecha más próxima' },
  { id: 'puntaje_organizador', label: 'Mejor puntuación organizador' },
];

export const PURCHASE_TABS = ['Todas', 'Próximas', 'Pasadas'];

/**
 * Filtra y ordena eventos según texto, categoría y criterio de orden.
 */
export function filterAndSortEvents(events = [], { query = '', selectedCategory = 'all', sortOption = 'default' } = {}) {
  let result = [...(events || [])];

  // 1. Filtrado textual (nombre, descripción, ubicación, categoría)
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (e) =>
        (e.nombre && e.nombre.toLowerCase().includes(q)) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(q)) ||
        (e.ubicacion && e.ubicacion.toLowerCase().includes(q)) ||
        (e.categoriaNombre && e.categoriaNombre.toLowerCase().includes(q))
    );
  }

  // 2. Filtrado por categoría
  if (selectedCategory && selectedCategory !== 'all') {
    result = result.filter((e) => e.categoriaId === selectedCategory);
  }

  // 3. Ordenamiento multi-criterio
  switch (sortOption) {
    case 'precio_asc':
      result.sort((a, b) => (a.precioMinimo ?? 0) - (b.precioMinimo ?? 0));
      break;
    case 'precio_desc':
      result.sort((a, b) => (b.precioMinimo ?? 0) - (a.precioMinimo ?? 0));
      break;
    case 'fecha_asc':
      result.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      break;
    case 'puntaje_organizador':
      result.sort((a, b) => (b.organizadorPuntaje || 0) - (a.organizadorPuntaje || 0));
      break;
    default:
      break;
  }

  return result;
}

/**
 * Filtra compras según pestaña activa: Todas, Próximas o Pasadas.
 */
export function filterPurchases(purchases = [], activeTab = 'Todas') {
  const list = purchases || [];
  return list.filter((p) => {
    if (activeTab === 'Todas') return true;
    if (activeTab === 'Próximas') {
      return p.estado === 'CONFIRMADA' || p.estado === 'PENDIENTE';
    }
    if (activeTab === 'Pasadas') {
      return p.estado === 'UTILIZADA' || p.estado === 'CANCELADA';
    }
    return true;
  });
}

/**
 * Particiona eventos según categoría y condición de destacado.
 */
export function partitionEvents(events = [], selectedCategoryId = 'all') {
  const list = events || [];
  const filtered = list.filter((e) => {
    if (selectedCategoryId === 'all') return true;
    return e.categoriaId === selectedCategoryId;
  });

  const featured = filtered.filter((e) => e.destacado);
  const other = filtered.filter((e) => !e.destacado);

  return { filtered, featured, other };
}
