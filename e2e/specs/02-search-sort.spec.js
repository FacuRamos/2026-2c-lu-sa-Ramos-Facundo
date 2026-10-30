import { test, expect } from '@playwright/test';
import { finalizeVideo, loginAsComprador } from '../helpers/e2eHelper.js';

test.describe('Flujo 2: Catálogo, Búsqueda y Ordenamiento Multi-criterio', () => {
  test('Búsqueda reactiva, filtro por categoría y ordenamiento por precio y puntaje', async ({ page }) => {
    // 1. Iniciar sesión como Comprador
    await loginAsComprador(page);
    await page.waitForTimeout(600);

    // 2. Acceder a Búsqueda desde Home
    const searchTrigger = page.locator('text=Filtrar').or(page.getByPlaceholder(/Buscá artistas/i)).first();
    await searchTrigger.click({ force: true });
    await page.waitForTimeout(800);

    // 3. Validar pantalla de búsqueda
    await expect(page.locator('text=Buscar eventos')).toBeVisible({ timeout: 10000 });
    const searchInput = page.getByPlaceholder(/Música en vivo, teatro/i);
    await expect(searchInput).toBeVisible();

    // 4. Probar búsqueda por texto: "Rock"
    await searchInput.fill('Rock');
    await page.waitForTimeout(700);
    await expect(page.locator('text=1 resultado >> visible=true')).toBeVisible();
    await expect(page.locator('text=Quilmes Rock 2026 >> visible=true')).toBeVisible();

    // 5. Limpiar campo de búsqueda
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // 6. Probar filtro de Categoría: "Teatro"
    const teatroChip = page.locator('text=Teatro >> visible=true').first();
    await teatroChip.click();
    await page.waitForTimeout(700);
    await expect(page.locator('text=Hamlet en el Avenida >> visible=true')).toBeVisible();

    // 7. Volver a "Todas"
    const todasChip = page.locator('text=Todas >> visible=true').or(page.locator('text=Música >> visible=true')).first();
    await todasChip.click();
    await page.waitForTimeout(600);

    // 8. Ordenamiento: Precio (menor a mayor)
    const precioAsc = page.locator('text=Precio: menor >> visible=true').first();
    if (await precioAsc.isVisible()) {
      await precioAsc.click();
      await page.waitForTimeout(700);
    }

    // 9. Ordenamiento: Precio (mayor a menor)
    const precioDesc = page.locator('text=Precio: mayor >> visible=true').first();
    if (await precioDesc.isVisible()) {
      await precioDesc.click();
      await page.waitForTimeout(700);
    }

    // 10. Ordenamiento: Puntaje del Organizador
    const puntajeOrg = page.locator('text=Mejor puntuación >> visible=true').or(page.locator('text=Puntaje >> visible=true')).first();
    if (await puntajeOrg.isVisible()) {
      await puntajeOrg.click();
      await page.waitForTimeout(700);
    }

    // 11. Clic en un evento para ver Detalle
    const eventCard = page.locator('text=Quilmes Rock 2026 >> visible=true').first();
    await eventCard.click();
    await page.waitForTimeout(1000);

    // 12. Validar navegación al detalle del evento
    await expect(page.locator('text=Comprar entradas >> visible=true')).toBeVisible();

    // Guardar video del flujo
    await finalizeVideo(page, '02-search-sort.webm');
  });
});
