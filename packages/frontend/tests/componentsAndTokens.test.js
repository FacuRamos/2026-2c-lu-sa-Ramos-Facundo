import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../src/constants/theme.js';
import { USER_ROLES, DEFAULT_USERS } from '../src/constants/roles.js';

describe('Theme and Design Tokens Verification', () => {
  test('paleta de colores cumple con especificación estricta de la tarea', () => {
    assert.strictEqual(COLORS.background, '#F4F2EE');
    assert.strictEqual(COLORS.surface, '#FFFFFF');
    assert.strictEqual(COLORS.textPrimary, '#353735');
    assert.strictEqual(COLORS.textSecondary, '#85847E');
    assert.strictEqual(COLORS.primary, '#46717A');
    assert.strictEqual(COLORS.backgroundSecondary, '#EAECE8');

    // Estados pastel
    assert.strictEqual(COLORS.status.confirmada.bg, '#DCE9DE');
    assert.strictEqual(COLORS.status.pendiente.bg, '#F1E8D5');
    assert.strictEqual(COLORS.status.cancelada.bg, '#F0DEDA');
    assert.strictEqual(COLORS.status.utilizada.bg, '#EAECE8');
  });

  test('espaciados y radios consistentes', () => {
    assert.ok(SPACING.sm < SPACING.md);
    assert.ok(SPACING.md < SPACING.lg);
    assert.strictEqual(RADIUS.round, 999);
  });

  test('roles y usuarios de prueba configurados', () => {
    assert.strictEqual(USER_ROLES.BUYER, 'Comprador');
    assert.strictEqual(USER_ROLES.ORGANIZER, 'Organizador');
    assert.ok(DEFAULT_USERS.buyer.id);
    assert.ok(DEFAULT_USERS.organizer.id);
  });
});
