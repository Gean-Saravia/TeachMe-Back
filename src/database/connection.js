import sql from 'mssql'
import { DB_DATABASE, DB_PASSWORD, DB_SERVER, DB_USER } from '../config.js';

const dbSettings = {
    user: DB_USER,
    password: DB_PASSWORD,
    server: DB_SERVER,
    database: DB_DATABASE,
    options: {
         encrypt: true, // Si usas Azure SQL, de lo contrario, puedes omitirlo
        trustServerCertificate: true // Solo si estás desarrollando localmente
    }
}

export const getConnection = async () =>{
    try{
        const pool = await sql.connect(dbSettings);
        //console.log('Database connection established:', pool);
        return pool;
    } catch(error){
        console.error(error);
    }
}

export { sql };