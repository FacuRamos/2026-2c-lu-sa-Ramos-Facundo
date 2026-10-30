import { test, expect } from '@playwright/test';
import { finalizeVideo, loginAsComprador } from '../helpers/e2eHelper.js';

test.describe('Flujo 3: Compra Multi-tipo, Reseñas del Organizador y Pases Individuales', () => {
  test('Comprar múltiples tipos de entrada, ver reseñas previas y validar pases con códigos', async ({ page }) => {
    // 1. Iniciar sesión como Comprador
    await loginAsComprador(page);
    await page.waitForTimeout(600);

    // 2. Abrir evento Quilmes Rock 2026 desde la cartelera
    const eventCard = page.locator('text=Quilmes Rock 2026 >> visible=true').first();
    await eventCard.click();
    await page.waitForTimeout(800);

    // 3. Validar Detalle del Evento y presencia de reseñas de eventos anteriores
    await expect(page.locator('text=Quilmes Rock 2026 >> visible=true')).toBeVisible();
    await expect(page.locator('text=Reseñas del organizador >> visible=true').or(page.locator('text=PopArt Music >> visible=true')).first()).toBeVisible();

    // 4. Clic en "Comprar entradas"
    const buyBtn = page.locator('text=Comprar entradas >> visible=true').first();
    await buyBtn.click();
    await page.waitForTimeout(800);

    // 5. Validar pantalla de selección de entradas
    await expect(page.locator('text=Elegí tus entradas >> visible=true')).toBeVisible();

    // 6. Incrementar entradas para "Campo General"
    const generalCard = page.locator('text=Campo General >> visible=true').locator('..').locator('..');
    const plusGeneral = generalCard.locator('text=+').first();
    await plusGeneral.click();
    await page.waitForTimeout(400);

    // 7. Incrementar entradas para "Acceso VIP Front"
    const vipCard = page.locator('text=Acceso VIP Front >> visible=true').locator('..').locator('..');
    const plusVip = vipCard.locator('text=+').first();
    await plusVip.click();
    await page.waitForTimeout(500);

    // 8. Confirmar compra
    const submitPurchaseBtn = page.locator('text=Continuar con la compra >> visible=true').or(page.locator('text=Confirmar compra >> visible=true')).first();
    await submitPurchaseBtn.click();
    await page.waitForTimeout(1500);

    // 9. Validar navegación automática al Detalle de compra
    await expect(page.locator('text=Detalle de compra >> visible=true')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Tus entradas >> visible=true')).toBeVisible();
    await expect(page.locator('text=ACCESO: >> visible=true').first()).toBeVisible();

    // 10. Validar sección de navegación cruzada: "Otras entradas tuyas para este evento"
    const otherSection = page.locator('text=Otras entradas tuyas para este evento >> visible=true');
    await expect(otherSection).toBeVisible();
    await page.waitForTimeout(800);

    // 11. Cambiar a la otra entrada haciendo clic en la tarjeta relacionada
    const otherCard = page.locator('text=Ver entrada >> visible=true').first();
    if (await otherCard.isVisible()) {
      await otherCard.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Detalle de compra >> visible=true')).toBeVisible();
    }

    // Guardar video con evidencia completa
    await finalizeVideo(page, '03-purchase-multiticket.webm');
  });
});
