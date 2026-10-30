import { test, expect } from '@playwright/test';
import { finalizeVideo } from '../helpers/e2eHelper.js';

test.describe('Flujo 1: Autenticación, Roles y Navegación Segura', () => {
  test('Flujo completo de Login Comprador, Logout, Login Organizador y Logout', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      console.log('Dialog detectado:', dialog.message());
      await dialog.accept();
    });

    // 1. Abrir app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Verificar pantalla de Login
    await expect(page.locator('text=Ingresar a AI Ticket It')).toBeVisible({ timeout: 15000 });

    // 3. Seleccionar pestaña Comprador
    const buyerRoleBtn = page.locator('text=Comprador').first();
    await buyerRoleBtn.click();
    await page.waitForTimeout(400);

    // 4. Completar credenciales de Comprador
    const emailInput = page.getByPlaceholder(/martina/i);
    await emailInput.fill('juan.perez@example.com');
    await page.waitForTimeout(300);

    const passInput = page.getByPlaceholder('••••••••');
    await passInput.fill('password123');
    await page.waitForTimeout(300);

    // 5. Iniciar sesión
    await page.locator('text=Iniciar Sesión').click();

    // 6. Validar ingreso a la vista de Comprador
    await expect(page.locator('text=Buen día, Juan')).toBeVisible({ timeout: 15000 });
    await expect(page.getByPlaceholder('Buscá artistas, eventos o lugares...')).toBeVisible();
    await page.waitForTimeout(1000);

    // 7. Navegar al Perfil del Comprador
    const perfilTab = page.getByRole('link', { name: /Perfil/i });
    await perfilTab.click();
    await page.waitForTimeout(800);

    // 8. Verificar datos del usuario en perfil
    await expect(page.locator('text=Cerrar sesión')).toBeVisible();
    await page.waitForTimeout(500);

    // 9. Cerrar sesión
    await page.locator('text=Cerrar sesión').click();
    await page.waitForTimeout(1000);

    // 10. Validar regreso al login
    await expect(page.locator('text=Ingresar a AI Ticket It')).toBeVisible({ timeout: 10000 });

    // 11. Cambiar a pestaña Organizador
    const orgRoleBtn = page.locator('text=Organizador').first();
    await orgRoleBtn.click();
    await page.waitForTimeout(400);

    // 12. Completar credenciales de Organizador
    const orgEmailInput = page.getByPlaceholder(/contacto/i);
    await orgEmailInput.fill('contacto@popart.com');
    await page.waitForTimeout(300);

    const orgPassInput = page.getByPlaceholder('••••••••');
    await orgPassInput.fill('password123');
    await page.waitForTimeout(300);

    // 13. Iniciar sesión como Organizador
    await page.locator('text=Iniciar Sesión').click();

    // 14. Validar llegada al Dashboard del Organizador
    await expect(page.locator('text=Espacio organizador')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Crear nuevo evento')).toBeVisible();
    await page.waitForTimeout(1000);

    // 15. Salir del Dashboard
    const logoutBtn = page.locator('text=Salir').first();
    await logoutBtn.click();
    await page.waitForTimeout(800);

    // 16. Validar que volvió a Login
    await expect(page.locator('text=Ingresar a AI Ticket It')).toBeVisible();

    // Guardar video con nombre representativo
    await finalizeVideo(page, '01-auth-flow.webm');
  });
});
