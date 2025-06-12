import { Router } from 'express';
import albumsRouter from './modules/Albums/albums.routes';

export const router = Router();

router.use('/albums', albumsRouter);
