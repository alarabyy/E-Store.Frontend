export enum ShipmentStatus {
    Created = 'Created',
    PickedUp = 'PickedUp',
    InTransit = 'InTransit',
    OutForDelivery = 'OutForDelivery',
    Delivered = 'Delivered',
    Failed = 'Failed',
    ReturnedToSender = 'ReturnedToSender',
    Cancelled = 'Cancelled'
}

export enum CourierCode {
    Bosta = 'Bosta',
    DHL = 'DHL',
    Aramex = 'Aramex',
    FedEx = 'FedEx'
}

export interface Courier {
    id: number;
    name: string;
    code: CourierCode;
    displayName: string;
    logoUrl?: string;
}

export interface StoreCourierSetting {
    id: number;
    courierId: number;
    courierName: string;
    isEnabled: boolean;
    apiKeySet: boolean;
    apiSecretSet: boolean;
    accountNumber?: string;
}

export interface Shipment {
    id: number;
    orderId: number;
    orderNumber: string;
    courierName: string;
    trackingNumber: string;
    status: ShipmentStatus;
    codAmount?: number;
    labelUrl?: string;
    externalTrackingUrl?: string;
    createdAt: string;
}

export interface ShipmentStatusHistory {
    status: ShipmentStatus;
    description?: string;
    occurredAt: string;
    location?: string;
}

export interface ShipmentDetails extends Shipment {
    history: ShipmentStatusHistory[];
}

export interface TrackingResult {
    status: ShipmentStatus;
    events: ShipmentStatusHistory[];
}

export interface ConfigureCourierRequest {
    courierCode: CourierCode;
    apiKey?: string;
    apiSecret?: string;
    accountNumber?: string;
}

export interface CreateShipmentRequest {
    orderId: number;
    courierCode: CourierCode;
    codAmount?: number;
    notes?: string;
}

export interface ShipmentCreatedDto {
    id: number;
    trackingNumber: string;
    status: ShipmentStatus;
    labelUrl?: string;
    externalTrackingUrl?: string;
}