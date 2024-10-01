import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REFRESH_TOKEN, APP_URL, BACK_URL } from './config.js';
const OAuth2 = google.auth.OAuth2;

// Configuración de OAuth2
const oauth2Client = new OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
});

export const sendConfirmationEmail = async (email, hash, nombre, apellido) => {
    try {
        const accessToken = await oauth2Client.getAccessToken(); // Obtener el accessToken

        // Crear el transporter con OAuth2
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: "teachme.verificacion@gmail.com",
                clientId: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token, // Añadir el accessToken aquí
            }
        });

        const confirmationLink = `${BACK_URL}/api/users/confirm/${hash}`;
        const mailOptions = {
            from: 'teachme.verificacion@gmail.com', // Cambié process.env.EMAIL_USER por el email directamente
            to: email,
            subject: 'Verificación de cuenta',
            html: 
            `<html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #e6f3ff;
                                margin: 0;
                                padding: 0;
                            }
                            .card {
                                background-color: white;
                                border-radius: 12px;
                                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
                                padding: 40px;
                                margin: 50px auto;
                                max-width: 450px;
                                text-align: center; 
                            }
                            .logo {
                                width: 220px;
                                height: auto;
                                margin-bottom: 25px;
                            }
                            h1 {
                                color: #0a2c6b;
                                margin-bottom: 25px;
                                font-size: 28px;
                            }
                            p {
                                color: #2c4a6e;
                                margin-bottom: 30px;
                                font-size: 18px;
                                line-height: 1.5;
                            }
                            #btn-verificar{
                                color: white;
                            }
                            .button-container {        
                                margin-bottom: 20px;
                            }
                            .button {
                                background-color: #92cef5;
                                color: white;
                                padding: 14px 28px;
                                border: none;
                                border-radius: 8px;
                                font-size: 18px;
                                font-weight: bold;
                                cursor: pointer;
                                text-decoration: none;
                                transition: all 0.3s ease;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                display: inline-block; 
                            }
                            .button:hover {
                                background-color: #70b6e5;
                                color: white;
                                transform: translateY(-3px);
                                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
                            }
                            .link {
                                color: #0a2c6b;
                                text-decoration: none;
                                font-weight: bold;
                                transition: color 0.3s ease;
                            }
                            .link:hover {
                                color: #92cef5;
                                text-decoration: underline;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <a href='https://postimages.org/' target='_blank'><img src='https://i.postimg.cc/bwn5tWkk/foto.png' border='0' alt='foto'/></a>
                            <h1>¡Bienvenid@ ${nombre} ${apellido}!</h1>
                            <p>Muchas gracias por registrarse en nuestra plataforma. Para verificar su cuenta, ingrese al siguiente link:</p>
                                <div class="button-container">
                                    <a href="${confirmationLink}" class="button" id="btn-verificar">Verificar cuenta</a>
                                </div>
                                <p>Si no puede ver el botón, ingrese a este link:</p>
                                <a href="${confirmationLink}" class="link">${confirmationLink}</a>
                        </div>
                    </body>
                </html>`,
        };
        
        // Enviar el correo
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo electrónico enviado correctamente:', info.response);
    } catch (error) {
        console.log('Error al enviar el correo electrónico:', error);
    }
};
