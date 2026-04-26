import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(): Promise<Record<string, string>>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<{
        id: string;
        key: string;
        value: string;
    }>;
    setBulk(data: Record<string, string>): Promise<{
        message: string;
    }>;
}
