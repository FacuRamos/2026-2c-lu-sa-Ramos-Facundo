import { seedDemoData } from '../data/seeders/demoSeeder.js';

async function main() {
    console.log('==============================================');
    console.log('   Iniciando carga de datos de prueba...      ');
    console.log('==============================================\n');

    const result = await seedDemoData();

    console.log('✔ Usuarios creados:');
    result.usuarios.forEach(u => {
        console.log(`   - ID: ${u.id.padEnd(18)} | Nombre: ${u.nombreCompleto.padEnd(20)} | Email: ${u.email}`);
    });

    console.log('\n✔ Categorías creadas:');
    result.categorias.forEach(c => {
        console.log(`   - ID: ${c.id.padEnd(18)} | Nombre: ${c.nombre.padEnd(15)} | ${c.descripcion}`);
    });

    console.log('\n✔ Eventos creados:');
    result.eventos.forEach(e => {
        console.log(`   - ID: ${e.id.padEnd(18)} | Evento: ${e.nombre.padEnd(24)} | Org: ${e.organizador?.nombre || e.organizador}`);
        e.tiposEntrada.forEach(t => {
            console.log(`       * Tipo Entrada ID: ${t.id.padEnd(18)} | ${t.nombre.padEnd(15)} | $${t.precio} | Cupo: ${t.cupoDisponible}/${t.cupo}`);
        });
    });

    console.log('\n✔ Compras de prueba:');
    result.compras.forEach(c => {
        console.log(`   - ID: ${c.id.padEnd(12)} | Comprador: ${(c.comprador?.nombre || c.comprador).padEnd(10)} | Evento: ${(c.evento?.nombre || c.evento).padEnd(22)} | Estado: ${c.estado}`);
    });

    console.log('\n✔ Reseñas de prueba:');
    result.resenias.forEach(r => {
        console.log(`   - ID: ${r.id.padEnd(12)} | Puntuación: ${r.puntuacion}/5 | Detalle: "${r.detalle.substring(0, 40)}..."`);
    });

    console.log('\n==============================================');
    console.log('   ✔ Seeder completado con éxito.             ');
    console.log('==============================================');
}

main().catch(err => {
    console.error('Error al ejecutar el seeder:', err);
    process.exit(1);
});
