import { getConnection, sql } from '../database/connection.js';

//Trae las clases que el usuario haya contratado COMO ESTUDIANTE
export const getHirings = async (req, res) => {
    const { id_profesor, id_alumno, id_contratacion } = req.query
    try {
        const pool = await getConnection();
        
        if (id_profesor || id_alumno || id_contratacion) {
            const queryIdProfesor = id_profesor ? req.query.id_profesor : null;
            const queryIdAlumno = id_alumno ? req.query.id_alumno : null;
            const queryIdContratacion = id_contratacion ? req.query.id_contratacion : null;

            let sqlQuery = "SELECT Con.id, Con.fecha_contratacion, Con.total, Con.id_profesor, Con.id_alumno, Cla.titulo AS clase, Prof.nombre AS profesor, Prof.apellido AS profe_apellido, Alum.nombre AS alumno FROM Contrataciones AS Con JOIN Clases AS Cla ON Con.id_clase = Cla.id JOIN Usuarios AS Prof ON Con.id_profesor = Prof.id JOIN Usuarios AS Alum ON Con.id_alumno = Alum.id WHERE 1 = 1";

            if (queryIdProfesor){
                sqlQuery += " AND Con.id_profesor = @id_profesor"
            }
            if(queryIdAlumno){
                sqlQuery += " AND Con.id_alumno = @id_alumno"
            }
            if(queryIdContratacion){
                sqlQuery += " AND Con.id = @id_contratacion"
            }

            const result = await pool.request()
                .input("id_profesor", queryIdProfesor)
                .input("id_alumno", queryIdAlumno)
                .input("id_contratacion", queryIdContratacion)
                .query(sqlQuery);
            
                return res.json(result.recordset);
            }
            
            const result = await pool.request().query("SELECT Con.id, Con.fecha_contratacion, Con.total, Con.id_profesor, Con.id_alumno, Cla.titulo AS clase, Prof.nombre AS profesor, Alum.nombre AS alumno FROM Contrataciones AS Con JOIN Clases AS Cla ON Con.id_clase = Cla.id JOIN Usuarios AS Prof ON Con.id_profesor = Prof.id JOIN Usuarios AS Alum ON Con.id_alumno = Alum.id")
            
            if (result.recordset.length == 0) {
                return res.json({ message: 'No se encontró ninguna contratacion' });
            }
            res.json(result.recordset)
        } catch (error) {
        res.status(500).send(error.message);
    }
};

//Traer una sola contratacion
export const getOneHiring = async (req, res) => {
    const { id } = req.params
    try {
        const pool = await getConnection();

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
export const createHiring = async (req, res) => {
    const { id_clase, id_profesor, id_alumno,  total, fecha_contratacion = new Date() } = req.body;

    try {
        const pool = await getConnection();
        if (!pool) {
            return res.status(500).json({ message: 'La conexión a la base de datos falló.' });
        }
        // Consulta para verificar si la contratación ya existe
        const existingHiring = await pool.request()
            .input('id_clase', sql.Int, id_clase)
            .input('id_profesor', sql.Int, id_profesor)
            .input('id_alumno', sql.Int, id_alumno)
            .query(`SELECT COUNT(*) AS count FROM Contrataciones WHERE id_clase = @id_clase AND id_profesor = @id_profesor AND id_alumno = @id_alumno`);
    
        if (existingHiring.recordset[0].count > 0) {
            return res.status(409).json({ message: 'Ya existe una contratación con estos parámetros.' });
        }
        const result = await pool.request()
            .input('id_clase', sql.Int, id_clase)
            .input('id_profesor', sql.Int, id_profesor)
            .input('id_alumno', sql.Int, id_alumno)
            .input('fecha_contratacion', sql.Date, fecha_contratacion)
            .input('total', sql.Decimal, total)
            .query(`INSERT INTO Contrataciones (id_clase, id_profesor, id_alumno, fecha_contratacion, total)
                    OUTPUT inserted.*
                    VALUES (@id_clase, @id_profesor, @id_alumno, @fecha_contratacion, @total); SELECT SCOPE_IDENTITY() as id`);

        const idResult = result.recordset[0].id
        const resultJoins = await pool.request()
            .input("id", idResult)
            .query('SELECT Con.id, Con.fecha_contratacion, Con.total, Cla.titulo AS clase, Prof.nombre AS profesor, Alum.nombre AS alumno FROM Contrataciones AS Con JOIN Clases AS Cla ON Con.id_clase = Cla.id JOIN Usuarios AS Prof ON Con.id_profesor = Prof.id JOIN Usuarios AS Alum ON Con.id_alumno = Alum.id WHERE Con.id = @id')

        res.status(201).json({ message: 'Contratación realizada con éxito', hiring: resultJoins.recordset[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

