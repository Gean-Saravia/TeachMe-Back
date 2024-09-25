import {sql, getConnection} from '../database/connection.js'
import bcrypt from 'bcrypt';
import { SECRET_JWT_KEY } from '../config.js';
import jwt from 'jsonwebtoken'

export const getUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM Usuarios");
        if(result.recordset.length == 0){
            res.json({message: 'No hay usuarios'})
        } else{
            res.json(result.recordset);
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Este controlador está de prueba, todavía no se utiliza
export const getToken = async (req,res) =>{
    const token = req.headers.token;
    if(!token){
        return res.status(403).send('Acceso no autorizado')
    }
    try{
        const data = jwt.verify(token, SECRET_JWT_KEY)
        const userID = data.id
        const pool = await getConnection();
        const result = await pool
            .request()
            .input('id', userID)
            .query("SELECT * FROM Usuarios WHERE id = @id");
        res.json({msg: "Usuario encontrado con token", user: result.recordset })
    } catch(error){
        console.log(error);
        
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
        ubicacion = null, 
        biografia = null, 
        foto_perfil = null, 
        genero = null, 
        otro_genero = null, 
        nacionalidad = null, 
        telefono = null, 
        linkedin = null, 
        github = null, 
        portfolio = null, 
        idiomas = null, 
        nivel_idioma = null
    } = req.body;

    // Si los campos están vacíos arroja un error
    if ( (nombre || apellido || email || contrasenia || fecha_nacimiento) == null) {
        return res.status(400).json({ msg: "Por favor completá todos los campos obligatorios!" });
    }

    // Hasheo de contraseña con la dependencia de BCRYPT (el 10 indica el nivel de seguridad del hash)
    contrasenia = bcrypt.hashSync(contrasenia, 10)

    try {
        const pool = await getConnection();

        // Verifica que en la Base de Datos no exista una cuenta con el mismo email
        const doesExist = await pool
            .request()
            .input('email', email)
            .query("SELECT * FROM Usuarios WHERE email = @email")

        // console.log(doesExist);
        // console.log(email);
        
        // Si no existe una cuenta con ese mail, procede a registrarse con normalidad
        if (doesExist.recordset.length == 0){
            const result = await pool
                .request()
                .input("nombre", sql.VarChar, nombre)
                .input("apellido", sql.VarChar, apellido)
                .input("email", sql.VarChar, email)
                .input("contrasenia", sql.VarChar, contrasenia)
                .input("fecha_nacimiento", sql.Date, fecha_nacimiento)
                .input("ubicacion", sql.VarChar, ubicacion)
                .input("biografia", sql.Text, biografia)
                .input("foto_perfil", sql.VarChar, foto_perfil)
                .input("genero", sql.VarChar, genero)
                .input("otro_genero", sql.VarChar, otro_genero)
                .input("nacionalidad", sql.VarChar, nacionalidad)
                .input("telefono", sql.VarChar, telefono)
                .input("linkedin", sql.VarChar, linkedin)
                .input("github", sql.VarChar, github)
                .input("portfolio", sql.VarChar, portfolio)
                .input("idiomas", sql.VarChar, idiomas)
                .input("nivel_idioma", sql.VarChar, nivel_idioma)
                .query(
                "INSERT INTO Usuarios (nombre, apellido, fecha_nacimiento, email, contrasenia, ubicacion, biografia, foto_perfil, genero, otro_genero, nacionalidad, telefono,linkedin, github, portfolio, idiomas, nivel_idioma) VALUES (@nombre, @apellido, @fecha_nacimiento, @email, @contrasenia, @ubicacion, @biografia, @foto_perfil, @genero, @otro_genero, @nacionalidad, @telefono, @linkedin, @github, @portfolio, @idiomas, @nivel_idioma); SELECT SCOPE_IDENTITY() as id"
                );

            const user = {
                nombre, 
                apellido, 
                fecha_nacimiento, 
                email,
                contrasenia,
                ubicacion,
                biografia,
                foto_perfil, 
                genero, 
                otro_genero, 
                nacionalidad, 
                telefono, 
                linkedin, 
                github, 
                portfolio, 
                idiomas, 
                nivel_idioma,
                id: result.recordset[0].id,
            }
    
            res
            .status(200)
            .json({
                msg: `¡${user.nombre}, gracias por unirte a Teach Me!`,
                data: user,
                success: true,
            });
        } else {
            res
            .status(400)
            .json({
                msg: "Ya existe un usuario con ese correo electrónico",
                success: false
            })
        }

    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

// Controlador para ACCEDER los usuarios (login / sign in)
export const access = async(req,res) =>{
    let {contrasenia, email} = req.body
    
    try{
        const pool = await getConnection();

        const user = await pool
            .request()
            .input('email', email)
            .query("SELECT * FROM Usuarios WHERE email = @email")

        if(user?.recordset.length == 0){
            return res.status(404).json({msg: 'No se encontró usuario con ese email', success: false})
        }

        const userDB = user.recordset[0]        
        
        let token = jwt.sign(
            { id: userDB.id, email: userDB.email},
            SECRET_JWT_KEY,
            {
                expiresIn: '30'
            })
        
        // Obtiene la contraseña hasheada guardada en la BD y con bcypt las compara (tiene sus propios metodos)
        const coinciden = await bcrypt.compare(contrasenia, userDB.contrasenia);
        if (!coinciden){
            return res.status(400).json({msg: 'Alguno de los datos no coinciden con nuestros registros', success: false})
        } 
        /*
            .cookie('access_token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
                maxAge: 1000 * 60 * 60
            })
        */
        return res.status(200).json({
                msg: `¡Que bueno verte de nuevo, ${userDB.nombre}!`, 
                data: userDB, 
                token: token, 
                success: true
            })
    } catch(error){
        return res.status(500).json(error.message)
    }
}