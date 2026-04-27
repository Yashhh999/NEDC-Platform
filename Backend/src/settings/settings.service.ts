import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Allowlisted, non-sensitive setting keys. Keys that hold credentials
// (e.g. RAZORPAY_*, JWT_SECRET, DATABASE_URL) must NEVER be stored here —
// they belong in environment variables and the application reads them only
// on the server. The settings table is for tunable, non-secret values that
// admins are expected to edit at runtime.
const ALLOWED_KEYS = new Set<string>([
  'platform.name',
  'platform.support_email',
  'platform.support_phone',
  'notifications.email_on_enrollment',
  'notifications.email_on_inquiry',
  'notifications.weekly_report',
]);

const MAX_VALUE_LENGTH = 1000;

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.setting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      if (ALLOWED_KEYS.has(s.key)) result[s.key] = s.value;
    }
    return result;
  }

  async get(key: string) {
    if (!ALLOWED_KEYS.has(key)) return null;
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value || null;
  }

  async set(key: string, value: string) {
    this.assertKey(key);
    this.assertValue(value);
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async setBulk(data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      this.assertKey(key);
      this.assertValue(value);
    }
    const operations = Object.entries(data).map(([key, value]) =>
      this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );
    await this.prisma.$transaction(operations);
    return { message: 'Settings updated' };
  }

  private assertKey(key: string) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new BadRequestException(`Setting key "${key}" is not allowed`);
    }
  }

  private assertValue(value: unknown) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Setting value must be a string');
    }
    if (value.length > MAX_VALUE_LENGTH) {
      throw new BadRequestException(
        `Setting value exceeds ${MAX_VALUE_LENGTH} characters`,
      );
    }
  }
}
