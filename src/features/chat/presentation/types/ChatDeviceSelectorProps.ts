import type { Device } from '@/features/device/domain/entities/Device';

export interface ChatDeviceSelectorProps {
    devices: Device[];
    selectedDeviceId: string | null;
    onSelectDevice: (deviceId: string) => void;
}
