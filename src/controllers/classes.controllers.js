import { getConnection, sql } from '../database/connection.js';

//Trae las clases disponibles
export const getClass = async (req, res) => {
    let {titulo, id_materia, id_clase, id_profesor} = req.query
    try {
        const pool = await getConnection();
        
        // Si hay un parámetro de búsqueda por nombre de materia
        if (titulo || id_materia || id_clase || id_profesor) {
            const queryTitulo = titulo ? `%${req.query.titulo}%` : null;
            const queryIdMateria = id_materia ? req.query.id_materia : null;
            const queryIdClase = id_clase ? req.query.id_clase : null;
            const queryIdProfe = id_profesor ? req.query.id_profesor : null;

            let sqlQuery = "SELECT Cla.id, Cla.titulo, Cla.descripcion, Cla.precio_hora, Cla.fecha_creacion, Cla.id_materias, Prof.nombre AS profesor, Prof.apellido AS profe_apellido, Prof.foto_perfil AS foto_profe, Prof.id AS profe_id, Mat.nombre_materia AS materia FROM Clases AS Cla JOIN Usuarios AS Prof ON Cla.id_profesor = Prof.id JOIN Materias AS Mat ON Cla.id_materias = Mat.id WHERE 1=1";

            if (queryTitulo) {
                sqlQuery += " AND Cla.titulo LIKE @titulo";
            }
            
            if (queryIdMateria) {
                sqlQuery += " AND Cla.id_materias = @id_materia";
            }
            if (queryIdClase) {
                sqlQuery += " AND Cla.id = @id_clase";
            }
            if (queryIdProfe) {
                sqlQuery += " AND Cla.id_profesor = @id_profesor";
            }
            /*
            if (result.recordset.length == 0) {
                return res.json({ message: 'No se encontró ninguna clase' });
            }
            */
            const result = await pool.request()
                .input("titulo", queryTitulo)
                .input("id_materia", queryIdMateria)
                .input("id_clase", queryIdClase)
                .input("id_profesor", queryIdProfe)
                .query(sqlQuery);
            return res.json(result.recordset);
        }

        // Si no hay parámetro, traer todas las materias
        const result = await pool.request().query("SELECT Cla.id, Cla.titulo, Cla.descripcion, Cla.precio_hora, Cla.fecha_creacion, Cla.id_materias, Prof.nombre AS profesor, Prof.apellido AS profe_apellido, Prof.foto_perfil AS foto_profe, Prof.id AS profe_id, Mat.nombre_materia AS materia FROM Clases AS Cla JOIN Usuarios AS Prof ON Cla.id_profesor = Prof.id JOIN Materias AS Mat ON Cla.id_materias = Mat.id");

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
    const { id_profesor, id_materias, titulo, descripcion, precio_hora, fecha_creacion = new Date() } = req.body;

    try {
        const pool = await getConnection();
        if (!pool) {
            return res.status(500).json({ message: 'La conexión a la base de datos falló.' });
        }
        const result = await pool.request()
            .input('id_profesor', sql.Int, id_profesor)
            .input('id_materias', sql.Int, id_materias)
            .input('titulo', sql.VarChar, titulo)
            .input('descripcion', sql.VarChar, descripcion)
            .input('precio_hora', sql.Decimal, precio_hora)
            .input('fecha_creacion', sql.Date, fecha_creacion)
            .query(`INSERT INTO Clases (id_profesor, id_materias, titulo, descripcion, precio_hora, fecha_creacion)
                    OUTPUT inserted.*
                    VALUES (@id_profesor, @id_materias, @titulo, @descripcion, @precio_hora, @fecha_creacion); SELECT SCOPE_IDENTITY() as id`);

        const idResult = result.recordset[0].id
        const resultJoins = await pool.request()
            .input("id", idResult)
            .query('SELECT Cla.id, Cla.titulo, Cla.descripcion, Cla.precio_hora, Cla.fecha_creacion, Prof.nombre AS profesor, Mat.nombre_materia AS materia FROM Clases AS Cla JOIN Usuarios AS Prof ON Cla.id_profesor = Prof.id JOIN Materias AS Mat ON Cla.id_materias = Mat.id WHERE Cla.id = @id')

        res.status(201).json({ message: 'Clase creada correctamente', class: resultJoins.recordset[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Actualiza una clase
export const updateClass = async (req, res) => {
    const { id } = req.params;
    const { id_profesor, id_materias, titulo, descripcion, precio_hora } = req.body;

    try {
        const pool = await getConnection();
        if (!pool) {
            return res.status(500).json({ message: 'Database connection failed' });
        }

        // Verificar si la clase existe
        const classExists = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT 1 FROM Clases WHERE id = @id');

        if (classExists.recordset.length === 0) {
            return res.status(404).json({ message: 'No se encontró la clase' });
        }

        // Actualizar la clase
        const result = await pool.request()
            .input('id_profesor', sql.Int, id_profesor)
            .input('id', sql.Int, id)
            .input('id_materias', sql.Int, id_materias)
            .input('titulo', sql.VarChar, titulo)
            .input('descripcion', sql.VarChar, descripcion)
            .input('precio_hora', sql.Decimal, precio_hora)
            .query(`UPDATE Clases 
                    SET id_materias = @id_materias, 
                        titulo = @titulo, 
                        descripcion = @descripcion, 
                        precio_hora = @precio_hora 
                    OUTPUT inserted.*
                    WHERE id = @id`);

        res.status(200).json({ message: 'Clase actualizada correctamente!', data: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//AGREGAR TODOS LOS METODOS ACA


