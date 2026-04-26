import { SettingsService } from './settings.service';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getAll(): Promise<Record<string, string>>;
    setBulk(data: Record<string, string>): Promise<{
        message: string;
    }>;
}
