import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { orderCreationLimiter } from '../middleware/rate-limit.middleware.js';

const router = Router();

router.post('/', orderCreationLimiter, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', orderController.transitionStatus);
router.delete('/:id', orderController.deleteOrder);
router.get('/:id/events', orderController.streamOrderEvents);
router.post('/:id/simulate', orderController.simulateOrder);

export default router;
