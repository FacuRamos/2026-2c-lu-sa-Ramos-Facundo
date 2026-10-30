import { test, expect } from '@playwright/test';
import { finalizeVideo, clearSessionAndReload, loginAsOrganizador } from '../helpers/e2eHelper.js';

test.describe('Flujo 5: Gestión de Eventos y Ventas del Organizador', () => {
  test('Crear nuevo evento, verificar gestión de cupos y consultar panel de ventas', async ({ page }) => {
    // 1. Limpiar sesión e iniciar como Organizador (Luna Producciones)
    await clearSessionAndReload(page);
    await loginAsOrganizador(page);
    await page.waitForTimeout(800);

    // 2. Validar Dashboard del Organizador
    await expect(page.locator('text=Espacio organizador >> visible=true')).toBeVisible();
    await expect(page.getByText('Eventos publicados', { exact: true })).toBeVisible();
    await expect(page.getByText('Entradas vendidas', { exact: true })).toBeVisible();

    // 3. Clic en "Crear nuevo evento"
    const createBtn = page.locator('text=Crear nuevo evento >> visible=true').first();
    await createBtn.click();
    await page.waitForTimeout(800);

    // 4. Validar pantalla "Crear evento"
    await expect(page.locator('text=Crear evento >> visible=true')).toBeVisible();

    // 5. Personalizar nombre del evento
    const nameInput = page.getByPlaceholder(/Luna Park Sessions|Nombre del evento/i).or(page.locator('input').first());
    await nameInput.fill('Festival Indie Quilmes 2026');
    await page.waitForTimeout(400);

    // 6. Clic en "Publicar evento"
    const publishBtn = page.locator('text=Publicar evento >> visible=true').first();
    await publishBtn.click();
    await page.waitForTimeout(1500);

    // 7. Validar llegada a pantalla de Gestión del evento
    await expect(page.locator('text=Festival Indie Quilmes 2026 >> visible=true')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Gestionar evento >> visible=true')).toBeVisible();
    await expect(page.locator('text=Disponibles >> visible=true')).toBeVisible();
    await page.waitForTimeout(800);

    // 8. Desde Acciones Rápidas del evento, acceder a "Compras" (Panel de Ventas)
    const salesAction = page.locator('text=Compras >> visible=true').first();
    await salesAction.click();
    await page.waitForTimeout(1000);

    // 9. Validar pantalla de Ventas / Compras del evento
    await expect(page.locator('text=compras registradas >> visible=true').or(page.locator('text=Compras: >> visible=true')).first()).toBeVisible();
    await page.waitForTimeout(800);

    // Guardar video con evidencia
    await finalizeVideo(page, '05-organizer-event-management.webm');
  });
});
