import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';

function buildPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  // Default to TLS for any non-local database. PGSSL_DISABLE=true is honoured
  // for explicitly trusted local environments only.
  const isLocal = /^postgres(ql)?:\/\/[^@]+@(localhost|127\.0\.0\.1)/i.test(
    connectionString,
  );
  const sslDisabled = process.env.PGSSL_DISABLE === 'true';

  const config: PoolConfig = { connectionString };
  if (!isLocal && !sslDisabled) {
    // rejectUnauthorized: true forces verification of the server certificate.
    // If your provider uses a self-signed cert, set PGSSL_CA to the CA bundle
    // path rather than disabling verification.
    config.ssl = {
      rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false',
    };
  }
  return config;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new Pool(buildPoolConfig());
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
