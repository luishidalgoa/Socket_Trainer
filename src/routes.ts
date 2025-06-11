import { Router } from 'express';
import albumsRouter from './modules/albums/albums.routes';

export const router = Router();

router.use('/albums', albumsRouter);
