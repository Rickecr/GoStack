import * as Yup from 'yup';

import CreateOrderMail from '../jobs/CreateOrderMail';
import Queue from '../../libs/Queue';

import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Order from '../models/Order';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient with ID not exists' });
    }

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman with ID not exists' });
    }

    const order = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    await Queue.add(CreateOrderMail.key, {
      recipient,
      deliveryman,
      product,
    });

    return res.json(order);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: {
        canceled_at: null,
      },
      limit: 15,
      offset: (page - 1) * 15,
      attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
        },
      ],
    });

    return res.json(orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id_order: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id_order } = req.params;

    const order = await Order.findByPk(id_order);

    if (!order) {
      return res.status(400).json({ error: 'Recipient with ID not exists' });
    }

    await order.update(req.body);
    order.save();

    return res.json(order);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id_order: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id_order } = req.params;

    const order = await Order.findByPk(id_order);

    if (order.canceled_at) {
      return res.status(400).json({ error: 'The order already deleted' });
    }

    await order.update({
      canceled_at: new Date(),
    });
    order.save();

    return res.json(order);
  }
}

export default new OrderController();
