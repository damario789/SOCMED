import express, { Router } from 'express';
import path from 'path';

export const staticRoutes: Router = Router();

// Serve static files from the uploads directory
staticRoutes.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
