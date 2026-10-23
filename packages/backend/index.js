import { app } from './src/app.js';
import { seedDemoData } from './data/seeders/demoSeeder.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        console.log('Cargando datos iniciales en memoria (demoSeeder)...');
        await seedDemoData();
        console.log('Datos iniciales cargados con éxito.');

        app.listen(PORT, () => {
            console.log(`AI Ticket It Backend escuchando en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error al iniciar el servidor:', err);
        process.exit(1);
    }
}

bootstrap();
