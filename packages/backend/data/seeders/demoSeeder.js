import { usuarioRepository } from '../../src/repositories/UsuarioRepository.js';
import { categoriaRepository } from '../../src/repositories/CategoriaRepository.js';
import { eventoRepository } from '../../src/repositories/EventoRepository.js';
import { compraRepository } from '../../src/repositories/CompraRepository.js';
import { reseniaRepository } from '../../src/repositories/ReseniaRepository.js';

import { Usuario } from '../../src/domain/entities/usuario.js';
import { Categoria } from '../../src/domain/entities/categoria.js';
import { Evento } from '../../src/domain/entities/evento.js';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { Compra } from '../../src/domain/entities/compra.js';
import { Resenia } from '../../src/domain/entities/resenia.js';
import { EstadoCompra } from '../../src/domain/enums/estadoCompra.js';

export async function seedDemoData() {
    // Limpiar repositorios para idempotencia
    await usuarioRepository.clear();
    await categoriaRepository.clear();
    await eventoRepository.clear();
    await compraRepository.clear();
    await reseniaRepository.clear();

    // 1. Usuarios con contraseña hasheada (Clase Semana 10)
    const defaultPasswordHash = await Usuario.hashPassword('password123');

    const comprador1 = new Usuario({
        id: 'usr-comprador-1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@example.com',
        password: defaultPasswordHash,
        rol: 'Comprador'
    });

    const comprador2 = new Usuario({
        id: 'usr-comprador-2',
        nombre: 'Lucía',
        apellido: 'Gómez',
        email: 'lucia.gomez@example.com',
        password: defaultPasswordHash,
        rol: 'Comprador'
    });

    const org1 = new Usuario({
        id: 'usr-org-1',
        nombre: 'Productora',
        apellido: 'PopArt Music',
        email: 'contacto@popart.com',
        password: defaultPasswordHash,
        rol: 'Organizador',
        nombreProductora: 'PopArt Music'
    });

    const org2 = new Usuario({
        id: 'usr-org-2',
        nombre: 'Teatro',
        apellido: 'Avenida',
        email: 'info@teatroavenida.com',
        password: defaultPasswordHash,
        rol: 'Organizador',
        nombreProductora: 'Teatro Avenida'
    });

    await usuarioRepository.create(comprador1);
    await usuarioRepository.create(comprador2);
    await usuarioRepository.create(org1);
    await usuarioRepository.create(org2);

    // 2. Categorías
    const catMusica = new Categoria({
        id: 'cat-musica',
        nombre: 'Música',
        descripcion: 'Recitales y festivales en vivo'
    });

    const catTeatro = new Categoria({
        id: 'cat-teatro',
        nombre: 'Teatro',
        descripcion: 'Obras de teatro, dramas y comedias'
    });

    const catDeportes = new Categoria({
        id: 'cat-deportes',
        nombre: 'Deportes',
        descripcion: 'Eventos y torneos deportivos'
    });

    await categoriaRepository.create(catMusica);
    await categoriaRepository.create(catTeatro);
    await categoriaRepository.create(catDeportes);

    // 3. Eventos
    const diezDiasEnFuturo = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const veinteDiasEnFuturo = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    const cincoDiasEnPasado = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const eventoRock = new Evento({
        id: 'ev-rock-2026',
        nombre: 'Quilmes Rock 2026',
        descripcion: 'El festival de rock más esperado del año con las bandas más influyentes',
        categoria: catMusica,
        organizador: org1,
        fecha: diezDiasEnFuturo,
        tiposEntrada: [
            new TipoEntrada({ id: 't-rock-campo', nombre: 'Campo General', precio: 15000, cupo: 500, cupoDisponible: 498 }),
            new TipoEntrada({ id: 't-rock-vip', nombre: 'Acceso VIP Front', precio: 35000, cupo: 100, cupoDisponible: 100 })
        ],
        multimedia: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745']
    });

    const eventoTeatro = new Evento({
        id: 'ev-teatro-hamlet',
        nombre: 'Hamlet en el Avenida',
        descripcion: 'Clásica obra de William Shakespeare con producción de primer nivel',
        categoria: catTeatro,
        organizador: org2,
        fecha: veinteDiasEnFuturo,
        tiposEntrada: [
            new TipoEntrada({ id: 't-teatro-platea', nombre: 'Platea Baja', precio: 12000, cupo: 80, cupoDisponible: 80 }),
            new TipoEntrada({ id: 't-teatro-pullman', nombre: 'Pullman', precio: 8000, cupo: 120, cupoDisponible: 120 })
        ],
        multimedia: ['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf']
    });

    const eventoPasado = new Evento({
        id: 'ev-acustico-pasado',
        nombre: 'Noche Acústica Íntima',
        descripcion: 'Concierto acústico exclusivo realizado la semana pasada',
        categoria: catMusica,
        organizador: org1,
        fecha: cincoDiasEnPasado,
        tiposEntrada: [
            new TipoEntrada({ id: 't-acustico-general', nombre: 'Entrada General', precio: 6000, cupo: 50, cupoDisponible: 48 })
        ],
        multimedia: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4']
    });

    await eventoRepository.create(eventoRock);
    await eventoRepository.create(eventoTeatro);
    await eventoRepository.create(eventoPasado);

    // 4. Compras
    // Compra 1: Confirmada para comprador 1 en Quilmes Rock
    const compra1 = new Compra({
        id: 'cmp-001',
        comprador: comprador1,
        evento: eventoRock,
        tipoEntrada: eventoRock.obtenerTipoEntrada('t-rock-campo'),
        cantidad: 2,
        estado: EstadoCompra.CONFIRMADA,
        fechaCompra: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    compra1.agregarMensaje(comprador1, '¿A qué hora abren las puertas?');
    compra1.agregarMensaje(org1, 'Hola Juan! Las puertas abren a las 16:00 hs.');

    // Compra 2: Utilizada para comprador 2 en el evento acústico pasado
    const compra2 = new Compra({
        id: 'cmp-002',
        comprador: comprador2,
        evento: eventoPasado,
        tipoEntrada: eventoPasado.obtenerTipoEntrada('t-acustico-general'),
        cantidad: 2,
        estado: EstadoCompra.UTILIZADA,
        fechaCompra: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    await compraRepository.create(compra1);
    await compraRepository.create(compra2);

    // 5. Reseña
    // Lucía califica el evento acústico de PopArt tras haber utilizado su entrada
    const resenia1 = new Resenia({
        id: 'res-001',
        comprador: comprador2,
        evento: eventoPasado,
        detalle: 'Increíble acústico, la organización impecable y la acústica del lugar insuperable!',
        puntuacion: 5,
        fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    await reseniaRepository.create(resenia1);

    // Guardar favoritos de prueba
    comprador1.agregarFavorito(eventoRock);
    await usuarioRepository.update(comprador1);

    return {
        usuarios: [comprador1, comprador2, org1, org2],
        categorias: [catMusica, catTeatro, catDeportes],
        eventos: [eventoRock, eventoTeatro, eventoPasado],
        compras: [compra1, compra2],
        resenias: [resenia1]
    };
}
