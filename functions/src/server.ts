import { createApp } from './createApp';
import { prisma } from './prisma';

const port = Number(process.env.PORT) || 8080;

async function main(): Promise<void> {
  await prisma.$connect();
  const app = createApp();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Lore Master API listening on ${port}`);
  });
}

main().catch((err) => {
  console.error('Server failed to start', err);
  process.exit(1);
});
