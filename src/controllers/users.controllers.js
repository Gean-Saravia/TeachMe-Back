import {sql, getConnection} from '../database/connection.js'
import bcrypt from 'bcrypt';

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

        // Si no existe una cuenta con ese mail, procede a registrarse con normalidad
        if (!doesExist){
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
    
            res.json({
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
            });
        } else {
            return res.status(400).json({ msg: "Ya existe un usuario con ese correo electrónico" })
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
        // Verifica que exista algun usuario en la Base de Datos con ese email registrado
        if(user?.recordset.length == 0) res.status(404).json({msg: 'No se encontró usuario con ese email'})
        
        // Obtiene la contraseña hasheada guardada en la BD y con bcypt las compara (tiene sus propios metodos)
        const contraseniaHash = user.recordset[0].contrasenia
        await bcrypt.compare(contrasenia, contraseniaHash, (err, result) =>{
            if(err){
                console.log(err);
                return;
            }
            if(result){
                console.log('contrasenias coinciden');
                res.status(200).json({msg: 'coinciden'})
            } else{
                console.log('no coinciden las psw');
                res.status(200).json({msg: 'no coinciden'})
            }
        })
        /*
        ----- NO BORRAR: ESTO ES PARA NO OLVIDARNOS DE MEJORAR EL MENSAJE DE RESPUESTA ------
        if (!isValid){
            return res.status(404).json({msg: 'Hay un error con el usuario o la contraseña'})
        } else {
            return res.status(200).json({
                //prueba: result.recordset[0],
                user: user.recordset,
                message: "Bienvenido " + email
            })
        }
*/
    } catch(error){
        res.status(500).send(error.message)
    }
}