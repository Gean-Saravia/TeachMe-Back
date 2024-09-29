import { sql, getConnection } from '../database/connection.js'
import bcrypt from 'bcrypt';
import { SECRET_JWT_KEY } from '../config.js';
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import moment from 'moment';
import { sendConfirmationEmail } from '../emailService.js'; // Importa el servicio de email

export const getUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM Usuarios");
        if (result.recordset.length == 0) {
            res.json({ message: 'No hay usuarios' })
        } else {
            res.json(result.recordset);
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Este controlador está de prueba, todavía no se utiliza
export const getToken = async (req, res) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(403).send('Acceso no autorizado')
    }
    try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        const userID = data.id
        const pool = await getConnection();
        const result = await pool
            .request()
            .input('id', userID)
            .query("SELECT * FROM Usuarios WHERE id = @id");
        return res.json({ msg: "Usuario encontrado con token", user: result.recordset, success: true })
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado', expiredAt: error.expiredAt, success: false });
        }

        // Si el error es un token inválido o cualquier otro tipo de error de JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido', success: false });
        }
    }
}

// Controlador para REGISTRAR usuarios (sign up)
export const register = async (req, res) => {
    let {
        nombre,
        apellido,
        fecha_nacimiento,
        email,
        contrasenia,
        fecha_registro = new Date(),
        pais_residencia = null,
        nacionalidad = null,
        foto_perfil = null,
        genero = null,
        telefono = null,
        linkedin = null,
        github = null,
        otras_redes = null
    } = req.body;

    console.log(fecha_registro);

    // Si los campos están vacíos arroja un error
    if (!nombre || !apellido || !email || !contrasenia || !fecha_nacimiento) {
        return res.status(400).json({ msg: "Por favor completá todos los campos obligatorios!" });
    }

    // Hasheo de contraseña con la dependencia de BCRYPT (el 10 indica el nivel de seguridad del hash)
    contrasenia = bcrypt.hashSync(contrasenia, 10)

    // Generar un hash aleatorio
    const temporal_hash = crypto.randomBytes(20).toString('hex');
    console.log("Hash generado:", temporal_hash);
    const tiempo_expiracion = moment().add(15, 'minutes').toDate();
    console.log("---------------------------------", tiempo_expiracion, "---------------------------------");

    try {
        const pool = await getConnection();
        const transaction = pool.transaction(); // Iniciar la transacción
        await transaction.begin();

        // Verifica que en la Base de Datos no exista una cuenta con el mismo email
        const doesExist = await transaction.request()
            .input('email', email)
            .query("SELECT * FROM Usuarios WHERE email = @email");

        // Si no existe una cuenta con ese mail, procede a registrarse con normalidad
        if (doesExist.recordset.length == 0) {
            const result = await transaction.request()
                .input("nombre", sql.VarChar, nombre)
                .input("apellido", sql.VarChar, apellido)
                .input("email", sql.VarChar, email)
                .input("contrasenia", sql.VarChar, contrasenia)
                .input("fecha_registro", sql.Date, fecha_registro)
                .input("fecha_nacimiento", sql.Date, fecha_nacimiento)
                .input("pais_residencia", sql.VarChar, pais_residencia)
                .input("nacionalidad", sql.VarChar, nacionalidad)
                .input("foto_perfil", sql.VarChar, foto_perfil)
                .input("genero", sql.VarChar, genero)
                .input("telefono", sql.VarChar, telefono)
                .input("linkedin", sql.VarChar, linkedin)
                .input("github", sql.VarChar, github)
                .input("otras_redes", sql.VarChar, otras_redes)
                .query(
                    "INSERT INTO Usuarios (nombre, apellido, fecha_nacimiento, email, contrasenia, fecha_registro, pais_residencia, nacionalidad, foto_perfil, genero, telefono, linkedin, github, otras_redes) VALUES (@nombre, @apellido, @fecha_nacimiento, @email, @contrasenia, @fecha_registro, @pais_residencia, @nacionalidad, @foto_perfil, @genero, @telefono, @linkedin, @github, @otras_redes); SELECT SCOPE_IDENTITY() as id"
                );

            const idUsuarioNuevo = result.recordset[0].id;

            const pruebaHash = await transaction.request()
                .input('id_usuario', sql.Int, idUsuarioNuevo)
                .input('temporal_hash', sql.VarChar, temporal_hash)
                .input('tiempo_expiracion', sql.DateTime, tiempo_expiracion)
                .query(
                    "INSERT INTO Verificacion (id_usuario, temporal_hash, tiempo_expiracion) VALUES (@id_usuario, @temporal_hash, @tiempo_expiracion); SELECT SCOPE_IDENTITY() as id_verificacion"
                );

            console.log("id del usuario:", idUsuarioNuevo);

            // Si todo es exitoso, confirmar la transacción
            await transaction.commit();

            // Enviar el correo de confirmación
            await sendConfirmationEmail(email, temporal_hash, nombre, apellido);
            console.log({ message: 'Usuario registrado y correo enviado' });

            const user = {
                nombre,
                apellido,
                fecha_nacimiento,
                email,
                contrasenia,
                fecha_registro,
                pais_residencia,
                nacionalidad,
                foto_perfil,
                genero,
                telefono,
                linkedin,
                github,
                otras_redes,
                id: idUsuarioNuevo,
                pruebaHash
            };

            res.status(200).json({
                msg: `¡${user.nombre}, gracias por unirte a Teach Me!`,
                data: user,
                success: true,
            });
        } else {
            await transaction.rollback();
            res.status(400).json({
                msg: "Ya existe un usuario con ese correo electrónico",
                success: false
            });
        }

    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Controlador para ACCEDER los usuarios (login / sign in)
export const access = async (req, res) => {
    let { contrasenia, email } = req.body;

    try {
        const pool = await getConnection();

        const user = await pool
            .request()
            .input('email', email)
            .query("SELECT * FROM Usuarios WHERE email = @email");

        if (user?.recordset.length == 0) {
            return res.status(404).json({ msg: 'Alguno de los datos no concide con nuestros registros', success: false });
        }

        const userDB = user.recordset[0];

        let token = jwt.sign(
            { id: userDB.id, email: userDB.email },
            SECRET_JWT_KEY,
            { expiresIn: '2h' }
        );

        // Comparar la contraseña ingresada con la almacenada en la base de datos
        const coinciden = await bcrypt.compare(contrasenia, userDB.contrasenia);
        if (!coinciden) {
            return res.status(400).json({ msg: 'Alguno de los datos no coincide con nuestros registros', success: false });
        }

        return res.status(200).json({
            msg: `¡Que bueno verte de nuevo, ${userDB.nombre}!`,
            data: userDB,
            token: token,
            success: true
        });
    } catch (error) {
        return res.status(500).json(error.message);
    }
};
