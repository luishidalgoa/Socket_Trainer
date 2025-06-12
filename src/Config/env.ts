import dotenv from 'dotenv';
import express from "express";

dotenv.config();

const app = express().use(express.json()); // Crear una instancia de Express

export const PORT = process.env.PORT;
export const HOST = process.env.HOST;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';