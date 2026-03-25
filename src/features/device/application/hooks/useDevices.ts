'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest, DeviceTokenResponse } from '@/features/device/domain/entities/Device';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';
import { getDevicesApi, createDeviceApi, updateDeviceApi, deleteDeviceApi, rotateDeviceTokenApi } from '@/api/endpoints/device';
import type { ApiError } from '@/shared/types/api';

interface UseDevicesReturn {
    devices: Device[];
    filteredDevices: Device[];
    selectedDevice: Device | null;
    selectedDeviceId: string | null;
    setSelectedDeviceId: (id: string | null) => void;
    createDevice: (request: CreateDeviceRequest) => Promise<DeviceTokenResponse>;
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
 * - 생성/수정/삭제/토큰재발급 후 자동으로 목록을 갱신합니다.
 * - plainToken은 등록/재발급 시 1회만 노출됩니다.
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

    /** 디바이스 등록 (plainToken 1회 노출) */
    const createDevice = useCallback(async (request: CreateDeviceRequest): Promise<DeviceTokenResponse> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await createDeviceApi(currentSiteId, request);
            if (response.success) {
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

/** Axios 에러에서 ApiError 추출 헬퍼 */
function extractApiError(err: unknown): ApiError {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: ApiError } } };
        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error;
        }
    }

    return {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
    };
}
