import moment from 'moment';
import { getConnection } from './database/connection.js';

export const verifyTemporaryHash = async (req, res) => {
    const { hash } = req.params; // El hash viene en la URL

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('temporal_hash', hash)
            .query('SELECT * FROM Verificacion WHERE temporal_hash = @temporal_hash');

        if (result.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'El hash no es válido o ya ha sido utilizado' });
        }

        const temporal_hash = result.recordset[0];
        const currentDate = moment().toDate();

        if (currentDate > temporal_hash.expirationDate) {
            return res.status(400).json({ success: false, message: 'El hash ha expirado' });
        }

        // Si el hash es válido y no ha expirado, puedes continuar con la confirmación
        await pool.request()
            .input('hash', hash)
            .query('DELETE FROM Verificacion WHERE temporal_hash = @hash'); // Elimina el hash después de su uso

        return res.status(200).json({ success: true, message: 'Registro confirmado correctamente' });
    } catch (error) {
        console.error('Error al verificar el hash:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};
