import crypto from 'crypto';
import moment from 'moment';
import { getConnection } from '../database/connection.js';

export const createTemporaryHash = async (req, res) => {
    // Generar un hash aleatorio
    const hash = crypto.randomBytes(20).toString('hex'); //crea el hash random
    const tiempo_expiracion = moment().add(15, 'minutes').toDate(); // Establecer fecha de expiración

    try {
        const pool = await getConnection();
        await pool.request()
            .input('hash', hash)
            .input('expirationDate', tiempo_expiracion)
            .query('INSERT INTO Verificacion (hash, tiempo_expiracion) VALUES (@hash, @tiempo_expiracion)');
        
        res.json({ success: true, hash });
    } catch (error) {
        console.error('Error al crear el hash:', error);
        res.status(500).json({ success: false, message: 'Error al crear el hash' });
    }
};
