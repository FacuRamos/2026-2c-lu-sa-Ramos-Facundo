import { seedDemoData } from '../../data/seeders/demoSeeder.js';

export class SeedController {
    seed = async (req, res, next) => {
        try {
            const result = await seedDemoData();
            res.status(200).json({
                message: 'Base de datos en memoria reinicializada con éxito',
                resumen: {
                    usuarios: result.usuarios.length,
                    categorias: result.categorias.length,
                    eventos: result.eventos.length,
                    compras: result.compras.length,
                    resenias: result.resenias.length
                }
            });
        } catch (err) {
            next(err);
        }
    };
}

export const seedController = new SeedController();
