'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest } from '@/features/device/domain/entities/Device';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';

/**
 * Mock UUID 생성 (토큰 시뮬레이션용)
 */
function generateMockToken(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
        const random = (Math.random() * 16) | 0;
        const value = character === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}

/** 최소한의 Mock Device 데이터 (API 연결 전 UI 확인용) */
const INITIAL_DEVICES: Device[] = [
    {
        deviceId: 'KIOSK-MAIN-01',
        siteId: 2,
        zoneId: 1,
        zoneSource: 'AUTO',
        locationName: '정문 안내소',
        latitude: 37.5783,
        longitude: 126.9768,
        isActive: true,
        lastPing: '2026-03-24T10:30:00',
        lastAuthAt: '2026-03-24T08:00:00',
        createdAt: '2026-03-01T10:00:00',
        updatedAt: '2026-03-24T10:30:00',
    },
    {
        deviceId: 'KIOSK-EAST-01',
        siteId: 2,
        zoneId: 3,
        zoneSource: 'MANUAL',
        locationName: '근정전 동쪽 입구',
        latitude: 37.5790,
        longitude: 126.9775,
        isActive: true,
        lastPing: null,
        lastAuthAt: null,
        createdAt: '2026-03-10T14:00:00',
        updatedAt: '2026-03-10T14:00:00',
    },
];

/**
 * Device CRUD 상태 관리 Mock 훅
 *
 * usePlaces와 동일한 패턴. API 연결 시 내부 구현만 교체하면 됨.
 */
export function useDevices() {
    const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

    const { currentSiteId } = useSiteContext();

    /** currentSiteId 기준 필터링 */
    const filteredDevices = useMemo(() => {
        if (currentSiteId === null) return [];
        return devices.filter((device) => device.siteId === currentSiteId);
    }, [devices, currentSiteId]);

    const selectedDevice = filteredDevices.find((device) => device.deviceId === selectedDeviceId) ?? null;

    /**
     * 디바이스 등록
     * @returns plainToken(1회성) + 생성된 Device
     */
    const createDevice = useCallback((request: CreateDeviceRequest): { plainToken: string; device: Device } => {
        if (currentSiteId == null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        const now = new Date().toISOString();
        const newDevice: Device = {
            deviceId: request.deviceId,
            siteId: currentSiteId,
            zoneId: request.zoneId ?? null,
            zoneSource: request.zoneSource ?? 'AUTO',
            locationName: request.locationName,
            latitude: request.latitude,
            longitude: request.longitude,
            isActive: request.isActive ?? true,
            lastPing: null,
            lastAuthAt: null,
            createdAt: now,
            updatedAt: now,
        };
        setDevices((previous) => [...previous, newDevice]);

        return { plainToken: generateMockToken(), device: newDevice };
    }, [currentSiteId]);

    /**
     * 디바이스 수정 (PATCH 시멘틱 — undefined 필드 무시)
     */
    const updateDevice = useCallback((deviceId: string, request: UpdateDeviceRequest) => {
        const sanitizedRequest = Object.fromEntries(
            Object.entries(request).filter(([, value]) => value !== undefined),
        );

        setDevices((previous) =>
            previous.map((device) =>
                device.deviceId === deviceId
                    ? { ...device, ...sanitizedRequest, updatedAt: new Date().toISOString() }
                    : device,
            ),
        );
    }, []);

    /**
     * 디바이스 삭제 (soft delete — isActive=false)
     */
    const deleteDevice = useCallback((deviceId: string) => {
        setDevices((previous) =>
            previous.map((device) =>
                device.deviceId === deviceId
                    ? { ...device, isActive: false, updatedAt: new Date().toISOString() }
                    : device,
            ),
        );
        setSelectedDeviceId((current) => (current === deviceId ? null : current));
    }, []);

    /**
     * 토큰 재발급 (기존 토큰 즉시 무효화, 새 토큰 반환)
     * @returns 새 plainToken
     */
    const rotateToken = useCallback((deviceId: string): string => {
        setDevices((previous) =>
            previous.map((device) =>
                device.deviceId === deviceId
                    ? { ...device, updatedAt: new Date().toISOString() }
                    : device,
            ),
        );
        return generateMockToken();
    }, []);

    /**
     * Zone 삭제 시 해당 zone을 참조하는 디바이스의 zoneId를 null로 초기화
     */
    const clearZoneReferences = useCallback((deletedZoneIds: number[]) => {
        setDevices((previous) =>
            previous.map((device) =>
                device.zoneId !== null && deletedZoneIds.includes(device.zoneId)
                    ? { ...device, zoneId: null, zoneSource: 'AUTO' as const, updatedAt: new Date().toISOString() }
                    : device,
            ),
        );
    }, []);

    return {
        devices,
        filteredDevices,
        selectedDevice,
        selectedDeviceId,
        setSelectedDeviceId,
        createDevice,
        updateDevice,
        deleteDevice,
        rotateToken,
        clearZoneReferences,
    };
}
