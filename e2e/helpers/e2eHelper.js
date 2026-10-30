import fs from 'fs';
import path from 'path';

export const VIDEOS_DIR = path.resolve('e2e/videos');

export function ensureVideosDir() {
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
}

/**
 * Guarda el video generado por Playwright en e2e/videos/<filename>.webm
 */
export async function finalizeVideo(page, filename) {
  ensureVideosDir();
  const video = page.video();
  if (video) {
    const dest = path.join(VIDEOS_DIR, filename);
    await page.close();
    await video.saveAs(dest);
    return dest;
  }
}

/**
 * Limpia la sesión almacenada en el navegador y vuelve al Login
 */
export async function clearSessionAndReload(page) {
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=Ingresar a AI Ticket It', { timeout: 10000 });
}

/**
 * Inicia sesión como Comprador
 */
export async function loginAsComprador(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Si ya está en la pantalla principal (Home o Dashboard)
  const isHomeVisible = await page.locator('text=Inicio').isVisible().catch(() => false);
  if (isHomeVisible) return;

  // Seleccionar rol Comprador si no está activo
  const compradorTab = page.locator('text=Comprador').first();
  if (await compradorTab.isVisible()) {
    await compradorTab.click();
  }

  // Llenar credenciales
  const emailInput = page.locator('input[type="email"], input[placeholder*="martina"]').first();
  await emailInput.fill('juan.perez@example.com');

  const passwordInput = page.locator('input[type="password"], input[placeholder*="••"]').first();
  await passwordInput.fill('password123');

  // Clic en Iniciar Sesión
  await page.locator('text=Iniciar Sesión').click();

  // Esperar a que cargue la vista de comprador
  await page.waitForSelector('text=Inicio', { timeout: 15000 });
}

/**
 * Inicia sesión como Organizador
 */
export async function loginAsOrganizador(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const isOrgVisible = await page.locator('text=Espacio organizador').isVisible().catch(() => false);
  if (isOrgVisible) return;

  // Seleccionar rol Organizador
  const orgTab = page.locator('text=Organizador').first();
  if (await orgTab.isVisible()) {
    await orgTab.click();
  }

  // Llenar credenciales
  const emailInput = page.locator('input[type="email"], input[placeholder*="contacto"]').first();
  await emailInput.fill('contacto@popart.com');

  const passwordInput = page.locator('input[type="password"], input[placeholder*="••"]').first();
  await passwordInput.fill('password123');

  // Clic en Iniciar Sesión
  await page.locator('text=Iniciar Sesión').click();

  // Esperar a que cargue el dashboard de organizador
  await page.waitForSelector('text=Espacio organizador', { timeout: 15000 });
}
