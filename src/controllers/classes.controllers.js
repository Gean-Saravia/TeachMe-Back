import { getConnection, sql } from '../database/connection.js';

//Trae las clases disponibles
export const getClass = async (req, res) => {
    try {
        const pool = await getConnection();
        
        // Si hay un parámetro de búsqueda por nombre de materia
        if (req.query.nombre_asignatura) {
            const query = `%${req.query.nombre_asignatura}%`; // Comodines para LIKE
            const result = await pool.request()
                .input("nombre_asignatura", query)
                .query("SELECT nombre FROM Clase WHERE nombre_asignatura LIKE @nombre_asignatura");
            
            if (result.recordset.length == 0) {
                return res.json({ message: 'Clase no disponible' });
            }
            return res.json(result.recordset);
        }

        // Si no hay parámetro, traer todas las materias
        const result = await pool.request().query("SELECT * FROM Clase");

        if (result.recordset.length == 0) {
            return res.json({ message: 'No hay clases' });
        } 
        res.json(result.recordset);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
};

//Crea una nueva clase
export const createClass = async (req, res) => {
    const { profesor_materia_id, precio_hora, descripcion, materia_id, nombre_asignatura } = req.body;

    try {
        const pool = await getConnection();
        if (!pool) {
            return res.status(500).json({ message: 'La conexión a la base de datos falló.' });
        }
        const result = await pool.request()
            .input('profesor_materia_id', sql.Int, profesor_materia_id)
            .input('precio_hora', sql.Decimal, precio_hora)
            .input('descripcion', sql.VarChar, descripcion)
            .input('materia_id', sql.Int, materia_id)
            .input('nombre_asignatura', sql.VarChar, nombre_asignatura)
            .query(`INSERT INTO Clase (profesor_materia_id, precio_hora, descripcion, materia_id, nombre_asignatura)
                    OUTPUT inserted.*
                    VALUES (@profesor_materia_id, @precio_hora, @descripcion, @materia_id, @nombre_asignatura)`);

        res.status(201).json({ message: 'Clase creada correctamente', class: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Actualiza una clase
export const updateClass = async (req, res) => {
    const { id } = req.params;
    const { profesor_materia_id, precio_hora, descripcion, materia_id, nombre_asignatura } = req.body;

    try {
        const pool = await getConnection();
        if (!pool) {
            return res.status(500).json({ message: 'Database connection failed' });
        }

        // Verificar si la clase existe
        const classExists = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT 1 FROM Clase WHERE id = @id');

        if (classExists.recordset.length === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Actualizar la clase
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('profesor_materia_id', sql.Int, profesor_materia_id)
            .input('precio_hora', sql.Decimal, precio_hora)
            .input('descripcion', sql.VarChar, descripcion)
            .input('materia_id', sql.Int, materia_id)
            .input('nombre_asignatura', sql.VarChar, nombre_asignatura)
            .query(`UPDATE Clase
                    SET profesor_materia_id = @profesor_materia_id,
                        precio_hora = @precio_hora,
                        descripcion = @descripcion,
                        materia_id = @materia_id,
                        nombre_asignatura = @nombre_asignatura
                    WHERE id = @id`);

        res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//AGREGAR TODOS LOS METODOS ACA


