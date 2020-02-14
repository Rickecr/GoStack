import { Router } from 'express';
import multer from 'multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import OrderStatusController from './app/controllers/OrderStatusController';

import AuthRecipients from './app/middlewares/Auth';

import MulterConfig from './config/multer';

const routes = new Router();
const upload = multer(MulterConfig);

// Entregas associadas a um entregador.
routes.get('/deliveryman/:deliveryman_id/orders', OrderStatusController.index);

routes.put(
  '/deliveryman/:deliveryman_id/orders/:id_order',
  upload.single('assinatura'),
  OrderStatusController.update
);

// Login de um Admin.
routes.post('/sessions', SessionController.store);

routes.use(AuthRecipients);

// Cadastrar um recipient.
routes.post('/recipients', RecipientController.store);
// Atualizar um recipient.
routes.put('/recipients', RecipientController.update);

// Couriers.
routes.post('/delivermans', DeliverymanController.store);
routes.get('/delivermans', DeliverymanController.index);
routes.put('/delivermans/:id', DeliverymanController.update);
routes.delete('/delivermans/:id', DeliverymanController.delete);

// Orders.
routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:id_order', OrderController.update);
routes.delete('/orders/:id_order', OrderController.delete);

// Uploads.
routes.post('/files', upload.single('avatar'), FileController.store);

export default routes;
