import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { UsuarioService } from '../../src/services/UsuarioService.js';
import { CategoriaService } from '../../src/services/CategoriaService.js';
import { EventoService } from '../../src/services/EventoService.js';
import { CompraService } from '../../src/services/CompraService.js';
import { ReseniaService } from '../../src/services/ReseniaService.js';

import { UsuarioRepository } from '../../src/repositories/UsuarioRepository.js';
import { CategoriaRepository } from '../../src/repositories/CategoriaRepository.js';
import { EventoRepository } from '../../src/repositories/EventoRepository.js';
import { CompraRepository } from '../../src/repositories/CompraRepository.js';
import { ReseniaRepository } from '../../src/repositories/ReseniaRepository.js';

import { EstadoCompra } from '../../src/domain/enums/estadoCompra.js';
import { NotFoundError, ConflictError, BusinessRuleError, UnauthorizedError } from '../../src/services/errors/ServiceError.js';
import { InsufficientCapacityError } from '../../src/domain/errors/DomainError.js';
import { createApp } from '../../src/app.js';
import { seedDemoData } from '../../data/seeders/demoSeeder.js';

describe('Services Layer Integration Tests', () => {
    let usuarioRepo, categoriaRepo, eventoRepo, compraRepo, reseniaRepo;
    let usuarioService, categoriaService, eventoService, compraService, reseniaService;

    beforeEach(() => {
        usuarioRepo = new UsuarioRepository();
        categoriaRepo = new CategoriaRepository();
        eventoRepo = new EventoRepository();
        compraRepo = new CompraRepository();
        reseniaRepo = new ReseniaRepository();

        usuarioService = new UsuarioService({ usuarioRepo, eventoRepo });
        categoriaService = new CategoriaService({ categoriaRepo });
        eventoService = new EventoService({ eventoRepo, categoriaRepo, usuarioRepo, reseniaRepo });
        compraService = new CompraService({ compraRepo, eventoRepo, usuarioRepo });
        reseniaService = new ReseniaService({ reseniaRepo, usuarioRepo, eventoRepo, compraRepo });
    });

    it('UsuarioService: crea usuario, previene email duplicado y maneja favoritos', async () => {
        const u = await usuarioService.crearUsuario({
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@test.com'
        });
        assert.ok(u.id);

        await assert.rejects(
            async () => await usuarioService.crearUsuario({ nombre: 'Otro', apellido: 'Pérez', email: 'juan@test.com' }),
            ConflictError
        );

        // Crear categoría y evento para probar favoritos
        const cat = await categoriaService.crearCategoria({ nombre: 'Recitales' });
        const ev = await eventoService.crearEvento({
            nombre: 'Cosquín Rock',
            descripcion: 'Festival anual',
            categoriaId: cat.id,
            organizadorId: u.id,
            fecha: new Date(Date.now() + 10000000).toISOString(),
            tiposEntrada: [{ nombre: 'General', precio: 5000, cupo: 100 }]
        });

        // Agregar favorito
        const favs = await usuarioService.agregarFavorito(u.id, { eventoId: ev.id });
        assert.strictEqual(favs.length, 1);

        // Eliminar favorito
        const { eliminado } = await usuarioService.eliminarFavorito(u.id, ev.id);
        assert.strictEqual(eliminado, true);
    });

    it('CategoriaService: crea categoría y previene nombres duplicados', async () => {
        const cat = await categoriaService.crearCategoria({ nombre: 'Teatro', descripcion: 'Obras' });
        assert.strictEqual(cat.nombre, 'Teatro');

        await assert.rejects(
            async () => await categoriaService.crearCategoria({ nombre: 'Teatro' }),
            ConflictError
        );
    });

    it('EventoService: crea, busca con filtros y calcula promedio de organizador', async () => {
        const org = await usuarioService.crearUsuario({ nombre: 'Productora', apellido: 'Rock' });
        const cat = await categoriaService.crearCategoria({ nombre: 'Festivales' });

        const ev1 = await eventoService.crearEvento({
            nombre: 'Quilmes Rock',
            descripcion: 'Festival en Buenos Aires',
            categoriaId: cat.id,
            organizadorId: org.id,
            fecha: new Date('2026-11-20T20:00:00Z').toISOString(),
            tiposEntrada: [
                { nombre: 'Campo', precio: 8000, cupo: 200 },
                { nombre: 'Platea', precio: 15000, cupo: 50 }
            ]
        });

        const ev2 = await eventoService.crearEvento({
            nombre: 'Festival de Jazz',
            descripcion: 'Jazz en vivo',
            categoriaId: cat.id,
            organizadorId: org.id,
            fecha: new Date('2026-09-10T20:00:00Z').toISOString(),
            tiposEntrada: [
                { nombre: 'Mesa', precio: 12000, cupo: 30 }
            ]
        });

        // Buscar por texto
        const resultadosBusqueda = await eventoService.buscarEventos({ busqueda: 'Quilmes' });
        assert.strictEqual(resultadosBusqueda.length, 1);
        assert.strictEqual(resultadosBusqueda[0].id, ev1.id);

        // Ordenar por precio asc
        const porPrecio = await eventoService.buscarEventos({ ordenarPor: 'precio', direccion: 'asc' });
        assert.strictEqual(porPrecio[0].id, ev1.id); // min 8000 vs min 12000

        // Detalle de evento
        const detalle = await eventoService.obtenerPorId(ev1.id);
        assert.strictEqual(detalle.precioMinimo, 8000);
        assert.strictEqual(detalle.precioMaximo, 15000);
        assert.strictEqual(detalle.entradasDisponiblesTotales, 250);
    });

    it('CompraService: realiza compra, descuenta cupo, consulta CU1 y CU2, y cancela con restitución de cupo', async () => {
        const comprador = await usuarioService.crearUsuario({ nombre: 'Comprador', apellido: 'Uno', email: 'comp@test.com' });
        const organizador = await usuarioService.crearUsuario({ nombre: 'Org', apellido: 'Dos', email: 'org@test.com' });
        const cat = await categoriaService.crearCategoria({ nombre: 'Recital' });

        const ev = await eventoService.crearEvento({
            nombre: 'Show Exclusivo',
            descripcion: 'Show intimo',
            categoriaId: cat.id,
            organizadorId: organizador.id,
            fecha: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            tiposEntrada: [{ id: 't-1', nombre: 'General', precio: 4000, cupo: 10 }]
        });

        // CU12: Realizar compra
        const compra = await compraService.realizarCompra({
            compradorId: comprador.id,
            eventoId: ev.id,
            tipoEntradaId: 't-1',
            cantidad: 3
        });

        assert.strictEqual(compra.total, 12000);
        assert.strictEqual(compra.estado, EstadoCompra.CONFIRMADA);

        // Verificar que el cupo disponible se redujo a 7
        const evActualizado = await eventoRepo.findById(ev.id);
        assert.strictEqual(evActualizado.obtenerTipoEntrada('t-1').cupoDisponible, 7);

        // Intentar comprar más del cupo disponible -> InsufficientCapacityError
        await assert.rejects(
            async () => await compraService.realizarCompra({
                compradorId: comprador.id,
                eventoId: ev.id,
                tipoEntradaId: 't-1',
                cantidad: 8
            }),
            InsufficientCapacityError
        );

        // CU1: Comprador visualiza sus compras con días faltantes si confirmada
        const comprasComprador = await compraService.obtenerComprasPorComprador(comprador.id);
        assert.strictEqual(comprasComprador.length, 1);
        assert.strictEqual(comprasComprador[0].estado, EstadoCompra.CONFIRMADA);
        assert.ok(typeof comprasComprador[0].diasFaltantesParaEvento === 'number');

        // CU2: Organizador visualiza compras y disponibilidad por tipo de entrada
        const infoEvento = await compraService.obtenerComprasPorEvento(ev.id, organizador.id);
        assert.strictEqual(infoEvento.totalCompras, 1);
        assert.strictEqual(infoEvento.disponibilidadPorTipo[0].cupoDisponible, 7);
        assert.strictEqual(infoEvento.disponibilidadPorTipo[0].vendidas, 3);

        // Intruso intenta ver compras del evento -> UnauthorizedError
        await assert.rejects(
            async () => await compraService.obtenerComprasPorEvento(ev.id, comprador.id),
            UnauthorizedError
        );

        // CU5 y CU6: Chat dentro de la compra
        const msg1 = await compraService.enviarMensaje(compra.id, {
            usuarioId: comprador.id,
            mensaje: 'Hola, ¿dónde retiro la pulsera?'
        });
        assert.strictEqual(msg1.mensaje, 'Hola, ¿dónde retiro la pulsera?');

        const msg2 = await compraService.enviarMensaje(compra.id, {
            usuarioId: organizador.id,
            mensaje: 'En la boletería con tu DNI.'
        });
        assert.strictEqual(msg2.mensaje, 'En la boletería con tu DNI.');

        // CU7 y CU8: Cancelar compra con reembolso y restitución de cupo
        const compraCancelada = await compraService.cancelarCompra(compra.id, {
            usuarioId: comprador.id,
            motivo: 'Imposibilidad de asistir',
            conReembolso: true
        });

        assert.strictEqual(compraCancelada.estado, EstadoCompra.REEMBOLSADA);
        const evTrasCancel = await eventoRepo.findById(ev.id);
        assert.strictEqual(evTrasCancel.obtenerTipoEntrada('t-1').cupoDisponible, 10);
    });

    it('ReseniaService: permite calificar solo cuando la compra está en estado UTILIZADA (CU9 y CU10)', async () => {
        const comprador = await usuarioService.crearUsuario({ nombre: 'Mateo', apellido: 'Sol', email: 'mateo@test.com' });
        const organizador = await usuarioService.crearUsuario({ nombre: 'Club', apellido: 'Musica', email: 'club@test.com' });
        const cat = await categoriaService.crearCategoria({ nombre: 'Acústico' });

        const ev = await eventoService.crearEvento({
            nombre: 'Noche Acústica',
            descripcion: 'Guitarra y voz',
            categoriaId: cat.id,
            organizadorId: organizador.id,
            fecha: new Date(Date.now() + 10000000).toISOString(),
            tiposEntrada: [{ id: 't-1', nombre: 'General', precio: 2000, cupo: 20 }]
        });

        const compra = await compraService.realizarCompra({
            compradorId: comprador.id,
            eventoId: ev.id,
            tipoEntradaId: 't-1',
            cantidad: 1
        });

        // Intento de reseñar compra aún CONFIRMADA -> falla por regla de negocio
        await assert.rejects(
            async () => await reseniaService.crearResenia({
                compradorId: comprador.id,
                eventoId: ev.id,
                compraId: compra.id,
                detalle: 'Muy lindo show',
                puntuacion: 5
            })
        );

        // Se marca la entrada como UTILIZADA
        await compraService.marcarUtilizada(compra.id, { usuarioId: organizador.id });

        // Ahora sí se permite crear la reseña (CU9)
        const resenia = await reseniaService.crearResenia({
            compradorId: comprador.id,
            eventoId: ev.id,
            compraId: compra.id,
            detalle: 'Excelente sonido y ambiente',
            puntuacion: 5
        });

        assert.strictEqual(resenia.puntuacion, 5);

        // Intento de reseña duplicada -> ConflictError
        await assert.rejects(
            async () => await reseniaService.crearResenia({
                compradorId: comprador.id,
                eventoId: ev.id,
                compraId: compra.id,
                detalle: 'Otra reseña',
                puntuacion: 4
            }),
            ConflictError
        );

        // CU10: Consultar reseñas y reputación del organizador
        const infoOrg = await reseniaService.obtenerReseniasPorOrganizador(organizador.id);
        assert.strictEqual(infoOrg.puntajePromedio, 5);
        assert.strictEqual(infoOrg.cantidadResenias, 1);
    });
});
