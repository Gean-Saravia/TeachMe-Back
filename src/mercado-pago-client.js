import { MercadoPagoConfig } from 'mercadopago';
import {MP_ACCESS_TOKEN} from '../src/config.js';

const client = new MercadoPagoConfig({
    accessToken: MP_ACCESS_TOKEN
});

export default client;
