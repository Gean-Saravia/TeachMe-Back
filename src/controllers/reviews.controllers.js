import { getConnection, sql } from '../database/connection.js';

//Trae las clases que el usuario haya contratado COMO ESTUDIANTE
export const getReviews = async (req, res) => {
    const { id } = req.query
    try {
        const pool = await getConnection();
        
        if (id) {
            const result = await pool.request()
                .input("id", id)
                .query("SELECT Con.id, Con.fecha_contratacion, Con.total, Cla.titulo AS clase, Prof.nombre AS profesor, Alum.nombre AS alumno FROM Contrataciones AS Con JOIN Clases AS Cla ON Con.id_clase = Cla.id JOIN Usuarios AS Prof ON Con.id_profesor = Prof.id JOIN Usuarios AS Alum ON Con.id_alumno = Alum.id WHERE Con.id_profesor = @id OR Con.id_alumno = @id");
            
            if (result.recordset.length == 0) {
                return res.json({ message: 'No se encontró ninguna contratacion' });
            }
            return res.json(result.recordset);
        }
        
    } catch (error) {
        res.status(500).send(error.message);
    }
};

//Traer una sola contratacion
export const getOneReview = async (req, res) => {
    const { id } = req.params
    try {
        const pool = await getConnection();
        
        // Si hay un parámetro de búsqueda por nombre de materia
        /*
        if (req.query.titulo) {
            const query = `%${req.query.titulo}%`; // Comodines para LIKE
            const result = await pool.request()
                .input("titulo", query)
                .query("SELECT * FROM Clases WHERE titulo LIKE @titulo");
            
            if (result.recordset.length == 0) {
                return res.json({ message: 'No se encontró ninguna clase' });
            }
            return res.json(result.recordset);
        }
            */

        // Si no hay parámetro, traer todas las materias
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT Con.id, Con.fecha_contratacion, Con.total, Cla.titulo AS clase, Prof.nombre AS profesor, Alum.nombre AS alumno FROM Contrataciones AS Con JOIN Clases AS Cla ON Con.id_clase = Cla.id JOIN Usuarios AS Prof ON Con.id_profesor = Prof.id JOIN Usuarios AS Alum ON Con.id_alumno = Alum.id WHERE Con.id = @id")
            //.query("SELECT * FROM Contrataciones WHERE id = @id");

        if (result.recordset.length == 0) {
            return res.json({ message: 'No hay contrataciones' });
        } 
        res.json(result.recordset);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
};

//Crea una nueva clase
export const createReview = async (req, res) => {
    const { id_clase, id_alumno, calificacion, comentario, fecha_resenia = new Date() } = req.body;

    try {
        const pool = await getConnection();
        if (!pool) {
            return res.status(500).json({ message: 'La conexión a la base de datos falló.' });
        }
        // Consulta para verificar si la contratación ya existe
        const existingReview = await pool.request()
            .input('id_clase', sql.Int, id_clase)
            .input('id_alumno', sql.Int, id_alumno)
            .input('calificacion', sql.Int, calificacion)
            .query(`SELECT COUNT(*) AS count FROM Resenias WHERE id_clase = @id_clase AND calificacion = @calificacion AND id_alumno = @id_alumno`);
    
        if (existingReview.recordset[0].count > 0) {
            return res.status(409).json({ message: 'Ya existe una reseña con estos parámetros.' });
        }

        const exist = await pool.request()
            .input('id_alumno', sql.Int, id_alumno)
            .input('id_clase', sql.Int, id_clase)
            .query('SELECT COUNT(*) AS count FROM Contrataciones AS Con WHERE id_clase = @id_clase AND id_alumno = @id_alumno')

        if(exist.recordset[0].count === 0){
            return res.json({msg: 'El usuario no forma parte de esta clase'})
        }


        const result = await pool.request()
            .input('id_clase', sql.Int, id_clase)
            .input('id_alumno', sql.Int, id_alumno)
            .input('calificacion', sql.Int, calificacion)
            .input('comentario', sql.VarChar, comentario)
            .input('fecha_resenia', sql.Date, fecha_resenia)
            .query(`INSERT INTO Resenias (id_clase, id_alumno, calificacion, comentario, fecha_resenia)
                    OUTPUT inserted.*
                    VALUES (@id_clase, @id_alumno, @calificacion, @comentario, @fecha_resenia); SELECT SCOPE_IDENTITY() as id`);

        const idResult = result.recordset[0].id
        const resultJoins = await pool.request()
            .input("id", idResult)
            .query('SELECT Res.id, Res.calificacion, Res.comentario, Res.fecha_resenia, Cla.titulo, Alum.nombre FROM Resenias AS Res JOIN Clases AS Cla ON Res.id_clase = Cla.id JOIN Usuarios AS Alum ON Res.id_alumno = Alum.id WHERE Res.id = @id')

        res.status(201).json({ message: 'Resenia creada con éxito', review: resultJoins.recordset[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};