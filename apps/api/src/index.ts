import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀  API running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();
