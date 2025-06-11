import { Router } from 'express';
import tradeRouter from './trade.routes';

const router = Router();

router.use('/trade', tradeRouter);

export default router;
