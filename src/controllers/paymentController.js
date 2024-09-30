import { Preference } from 'mercadopago';
import Payment from '../database/payment.js';
import client from '../mercado-pago-client.js'; // Asegúrate de que la ruta sea correcta

export const createPreference = async (req, res) => {
    try {
        const { title, quantity, unit_price } = req.body;
        const payment = new Payment(title, quantity, unit_price);

        const body = {
            items: [
                {
                    title: payment.title,
                    quantity: payment.quantity,
                    unit_price: payment.unitPrice,
                    currency_id: "ARS",
                },
            ],
            back_urls: {
                success: "https://teachme-learn.netlify.app/",
                failure: "https://www.youtube.com/@onthecode",
                pending: "https://www.youtube.com/@onthecode",
            },
            auto_return: "approved",
        };
        const preference = new Preference(client);
        const result = await preference.create({ body });
        console.log(result)
        res.json({
            id: result.id,
        });
        
    } catch (error) {
        console.error("Error al crear la preferencia:", error);
        res.status(500).json({
            error: "Error al crear la preferencia",
        });
    }
};
