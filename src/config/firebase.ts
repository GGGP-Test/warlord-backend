import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { initializeApp, AppOptions } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getVertexAI } from '@google-cloud/vertexai';
import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

// ---- Firebase Admin Initialization ----

let appInitialized = false;

export function getFirebaseApp() {
  if (!appInitialized) {
    const options: AppOptions = {
      projectId: process.env.GCP_PROJECT_ID,
    };

    initializeApp(options);
    appInitialized = true;
    logger.info('Firebase Admin initialized');
  }

  return admin.app();
}

export const db = getFirestore();

// ---- Vertex AI Initialization ----

let vertexInitialized = false;
let vertexClient: ReturnType<typeof getVertexAI> | null = null;

export function getVertexClient() {
  if (!vertexInitialized) {
    const project = process.env.VERTEX_AI_PROJECT_ID || process.env.GCP_PROJECT_ID;
    const location = process.env.VERTEX_AI_REGION || process.env.GCP_REGION || 'us-central1';

    if (!project) {
      logger.warn('Vertex AI project not configured. LLM features will be disabled.');
      throw new Error('VERTEX_AI_PROJECT_ID or GCP_PROJECT_ID must be set');
    }

    vertexClient = getVertexAI({ project, location });
    vertexInitialized = true;
    logger.info(`Vertex AI initialized for project=${project}, location=${location}`);
  }

  return vertexClient!;
}

// ---- Redis Initialization ----

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = Number(process.env.REDIS_PORT || 6379);
    const password = process.env.REDIS_PASSWORD;

    redisClient = createClient({
      socket: { host, port },
      password,
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', { err }));

    await redisClient.connect();
    logger.info(`Redis connected at ${host}:${port}`);
  }

  return redisClient;
}

// ---- Export Functions Namespace ----

export const fns = functions;
