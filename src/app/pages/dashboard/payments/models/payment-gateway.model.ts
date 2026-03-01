export interface PaymentGatewayDto {
    id: number;
    gatewayId: string;
    name: string;
    isActive: boolean;
    priority: number;
    weight: number;
    supportedCurrencies: string[];
    supportedCountries: string[];
    environment: number;
    createdAt: string;
    updatedAt?: string;
}

export enum GatewayEnvironment {
    Sandbox = 0,
    Production = 1
}
