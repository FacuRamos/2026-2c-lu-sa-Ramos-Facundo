import { test, expect } from '@playwright/test';
import { finalizeVideo, loginAsComprador, clearSessionAndReload } from '../helpers/e2eHelper.js';

test.describe('Flujo 4: Chat Interactivo Comprador ↔ Organizador', () => {
  test('Comprador envía consulta desde su compra y Organizador responde sin textos undefined', async ({ page }) => {
    // ----------------------------------------------------
    // PARTE 1: Comprador envía mensaje
    // ----------------------------------------------------
    await loginAsComprador(page);
    await page.waitForTimeout(600);

    // Ir a pestaña Compras
    const comprasTab = page.getByRole('link', { name: /Compras/i });
    await comprasTab.click();
    await page.waitForTimeout(800);

    // Abrir una compra activa
    const purchaseCard = page.locator('text=Quilmes Rock 2026 >> visible=true').or(page.locator('text=Campo General >> visible=true')).first();
    await purchaseCard.click();
    await page.waitForTimeout(800);

    // Clic en "Escribir al organizador"
    const chatBtn = page.locator('text=Escribir al organizador >> visible=true').first();
    await chatBtn.click();
    await page.waitForTimeout(800);

    // Validar pantalla de Chat
    await expect(page.getByPlaceholder('Escribí un mensaje...')).toBeVisible({ timeout: 10000 });

    // Escribir mensaje del comprador
    const msgInput = page.getByPlaceholder('Escribí un mensaje...');
    await msgInput.fill('¿A qué hora abren las puertas para Campo General?');
    await page.waitForTimeout(400);

    // Enviar mensaje
    const sendBtn = page.getByLabel('Enviar mensaje').first();
    await sendBtn.click();
    await page.waitForTimeout(1000);

    // Validar que el mensaje aparece en pantalla
    await expect(page.locator('text=¿A qué hora abren las puertas para Campo General? >> visible=true').first()).toBeVisible();
    await page.waitForTimeout(800);

    // ----------------------------------------------------
    // PARTE 2: Organizador ingresa y responde
    // ----------------------------------------------------
    await clearSessionAndReload(page);

    // Seleccionar Organizador
    const orgRole = page.locator('text=Organizador >> visible=true').first();
    await orgRole.click();
    await page.waitForTimeout(400);

    // PopArt Music es el organizador de Quilmes Rock 2026
    const orgEmail = page.getByPlaceholder(/contacto/i);
    await orgEmail.fill('contacto@popart.com');
    await page.waitForTimeout(300);

    const orgPass = page.getByPlaceholder('••••••••');
    await orgPass.fill('password123');
    await page.waitForTimeout(300);

    await page.locator('text=Iniciar Sesión >> visible=true').click();
    await page.waitForTimeout(1500);

    // Validar Dashboard del Organizador
    await expect(page.locator('text=Espacio organizador >> visible=true')).toBeVisible({ timeout: 15000 });

    // Abrir bandeja de mensajes ("Mensajes")
    const inboxBtn = page.locator('text=Mensajes >> visible=true').first();
    await inboxBtn.click();
    await page.waitForTimeout(1000);

    // Validar pantalla "Chat organizador"
    await expect(page.locator('text=Chat organizador >> visible=true')).toBeVisible();

    // Validar que la previsualización NO contiene "undefined"
    const undefinedText = page.locator('text=undefined >> visible=true');
    await expect(undefinedText).not.toBeVisible();

    // Entrar al chat de la conversación con el comprador
    const convCard = page.locator('text=Quilmes Rock 2026 >> visible=true').first();
    await convCard.click();
    await page.waitForTimeout(800);

    // Responder la consulta
    const orgMsgInput = page.getByPlaceholder('Escribí un mensaje...');
    await orgMsgInput.fill('Hola! Las puertas abren a las 17:00 hs. Te esperamos.');
    await page.waitForTimeout(400);

    const orgSendBtn = page.getByLabel('Enviar mensaje').first();
    await orgSendBtn.click();
    await page.waitForTimeout(1000);

    // Validar que la respuesta del organizador quedó registrada en la conversación
    await expect(page.locator('text=Hola! Las puertas abren a las 17:00 hs. Te esperamos. >> visible=true').first()).toBeVisible();

    // Guardar video del flujo bidireccional
    await finalizeVideo(page, '04-chat-communication.webm');
  });
});
