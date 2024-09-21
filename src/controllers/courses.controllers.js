import {getConnection} from '../database/connection.js'

export const getCourses = async (req, res) => {
    try {
        const pool = await getConnection();
        
        // Si hay un parámetro de búsqueda por nombre de materia
        if (req.query.nombre_materia) {
            const query = `%${req.query.nombre_materia}%`; // Comodines para LIKE
            const result = await pool.request()
                .input("nombre_materia", query)
                .query("SELECT * FROM Materias WHERE nombre_materia LIKE @nombre_materia");
            
            if (result.recordset.length == 0) {
                return res.json({ message: 'Materia no disponible' });
            }
            return res.json(result.recordset);
        }

        // Si no hay parámetro, traer todas las materias
        const result = await pool.request().query("SELECT * FROM Materias");

        if (result.recordset.length == 0) {
            return res.json({ message: 'No hay materias' });
        } 
        res.json(result.recordset);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
};




