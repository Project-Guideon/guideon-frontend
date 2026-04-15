'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest } from '@/features/device/domain/entities/Device';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';
import { getDevicesApi, pairDeviceApi, updateDeviceApi, deleteDeviceApi, rotateDeviceTokenApi } from '@/api/endpoints/device';
import type { ApiError } from '@/shared/types/api';
import { extractApiError } from '@/shared/utils/api';

interface UseDevicesReturn {
    devices: Device[];
    filteredDevices: Device[];
    selectedDevice: Device | null;
    selectedDeviceId: string | null;
    setSelectedDeviceId: (id: string | null) => void;
    createDevice: (request: CreateDeviceRequest) => Promise<Device>;
    updateDevice: (deviceId: string, request: UpdateDeviceRequest) => Promise<Device>;
    deleteDevice: (deviceId: string) => Promise<void>;
    rotateToken: (deviceId: string) => Promise<string>;
    refetchDevices: () => Promise<void>;
    isLoading: boolean;
    isMutating: boolean;
    error: ApiError | null;
}

/**
 * Device CRUD + 토큰 재발급 훅 (API 연동)
 *
 * - 현재 선택된 siteId 기준으로 Device 목록을 가져옵니다.
 * - 페어링 등록/수정/삭제/토큰재발급 후 자동으로 목록을 갱신합니다.
 * - 페어링 등록 시 plainToken은 키오스크가 직접 수령하므로 반환되지 않습니다.
 */
export function useDevices(): UseDevicesReturn {
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const { currentSiteId } = useSiteContext();

    /** Device 목록 전체 조회 */
    const fetchDevices = useCallback(async () => {
        if (currentSiteId === null) {
            setDevices([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getDevicesApi(currentSiteId, { size: 200 });
            if (response.success) {
                setDevices(response.data.items);
            } else {
                setDevices([]);
                setError({ code: response.error?.code ?? 'INTERNAL_ERROR', message: response.error?.message ?? 'Device 목록 조회에 실패했습니다.' });
            }
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            console.error('Device 목록 조회 실패:', apiError);
        } finally {
            setIsLoading(false);
        }
    }, [currentSiteId]);

    /** siteId 변경 시 자동 조회 */
    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    /** 활성 디바이스만 필터링 */
    const filteredDevices = useMemo(
        () => devices.filter((device) => device.isActive),
        [devices],
    );

    const selectedDevice = useMemo(
        () => devices.find((device) => device.deviceId === selectedDeviceId) ?? null,
        [devices, selectedDeviceId],
    );

    /** 페어링 코드로 디바이스 등록 (plainToken은 키오스크가 직접 수령) */
    const createDevice = useCallback(async (request: CreateDeviceRequest): Promise<Device> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await pairDeviceApi(currentSiteId, request);
            if (response.success && response.data) {
                await fetchDevices();
                return response.data;
            }
            throw new Error('디바이스 등록에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchDevices]);

    /** 디바이스 수정 */
    const updateDevice = useCallback(async (deviceId: string, request: UpdateDeviceRequest): Promise<Device> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await updateDeviceApi(currentSiteId, deviceId, request);
            if (response.success) {
                await fetchDevices();
                return response.data;
            }
            throw new Error('디바이스 수정에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchDevices]);

    /** 디바이스 삭제 (soft delete) */
    const deleteDevice = useCallback(async (deviceId: string): Promise<void> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await deleteDeviceApi(currentSiteId, deviceId);
            if (response.success) {
                setSelectedDeviceId((current) => (current === deviceId ? null : current));
                await fetchDevices();
            }
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchDevices]);

    /** 토큰 재발급 (기존 토큰 즉시 무효화, plainToken 1회 노출) */
    const rotateToken = useCallback(async (deviceId: string): Promise<string> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await rotateDeviceTokenApi(currentSiteId, deviceId);
            if (response.success) {
                await fetchDevices();
                return response.data.plainToken;
            }
            throw new Error('토큰 재발급에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchDevices]);

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
        refetchDevices: fetchDevices,
        isLoading,
        isMutating,
        error,
    };
}
