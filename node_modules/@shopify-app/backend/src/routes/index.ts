import { Router } from 'express';
import authRouter from './auth.js';
import apiRouter from './api/index.js';
import webhooksRouter from './webhooks.js';

export { authRouter, apiRouter, webhooksRouter };
