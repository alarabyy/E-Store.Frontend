export enum ServiceType {
    Payment = 0,
    Shipping = 1,
    SMS = 2,
    Analytics = 3
}

export interface ServiceConfigurationDto {
    id: number;
    name: string;
    logoUrl?: string;
    type: ServiceType;
    priority: number;
    weight: number;
    supportedCurrencies: string[];
    supportedCountries: string[];
    isActive: boolean;
    isConfigured: boolean;
    values: Record<string, string>;
    configurationKeys: string[];
}
