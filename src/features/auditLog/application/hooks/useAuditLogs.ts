'use client';

import { useState, useMemo } from 'react';
import type { AuditLogEntry, AuditLogType } from '@/features/auditLog/domain/entities/AuditLogEntry';

/**
 * 감사 로그 필터 상태
 */
interface AuditLogFilter {
    startDate: string;
    endDate: string;
    type: AuditLogType | '';
}

/**
 * Mock 데이터 — 향후 API 연동 시 이 부분만 교체
 */
const MOCK_PLATFORM_LOGS: AuditLogEntry[] = [
    {
        id: 1, type: 'USER', site: '경복궁',
        action: '관광지 생성', target: 'SITE-003', time: '방금 전',
        status: 'success', message: '새로운 관광지 "경복궁"이 생성되었습니다.',
    },
    {
        id: 2, type: 'DEVICE', site: '에버랜드',
        action: '장애 발생', target: 'KIOSK-006', time: '10분 전',
        status: 'warning', message: '네트워크 연결이 지연되고 있습니다.',
    },
    {
        id: 3, type: 'SYSTEM', site: '-',
        action: '시스템 백업', target: 'DB_Daily', time: '1시간 전',
        status: 'success', message: '일일 데이터 백업이 완료되었습니다.',
    },
    {
        id: 4, type: 'SYSTEM', site: '롯데월드',
        action: 'API 오류', target: 'Zone_API', time: '2시간 전',
        status: 'error', message: '구역 정보 동기화에 실패했습니다.',
    },
    {
        id: 5, type: 'USER', site: '에버랜드',
        action: '운영자 초대', target: 'operator@email.com', time: '3시간 전',
        status: 'success', message: '사이트 관리자 초대가 발송되었습니다.',
    },
    {
        id: 6, type: 'USER', site: '경복궁222',
        action: '관광지 생성', target: 'SITE-003', time: '방금 전',
        status: 'success', message: '새로운 관광지 "경복궁"이 생성되었습니다.',
    },
    {
        id: 7, type: 'DEVICE', site: '에버랜드222',
        action: '장애 발생', target: 'KIOSK-006', time: '10분 전',
        status: 'warning', message: '네트워크 연결이 지연되고 있습니다.',
    },
    {
        id: 8, type: 'SYSTEM', site: '-',
        action: '시스템 백업', target: 'DB_Daily', time: '1시간 전',
        status: 'success', message: '일일 데이터 백업이 완료되었습니다.',
    },
    {
        id: 9, type: 'SYSTEM', site: '롯데월드222',
        action: 'API 오류', target: 'Zone_API', time: '2시간 전',
        status: 'error', message: '구역 정보 동기화에 실패했습니다.',
    },
    {
        id: 10, type: 'USER', site: '에버랜드222',
        action: '운영자 초대', target: 'operator@email.com', time: '3시간 전',
        status: 'success', message: '사이트 관리자 초대가 발송되었습니다.',
    },
];

/**
 * useAuditLogs — 감사 로그 데이터 및 필터 관리 훅
 *
 * 향후 API 연동 시 Mock 데이터를 API 호출로 교체하면 됩니다.
 */
export function useAuditLogs() {
    const [filter, setFilter] = useState<AuditLogFilter>({
        startDate: '',
        endDate: '',
        type: '',
    });

    //페이지 상태
    const [page, setPage] = useState(0);
    const pageSize = 5;

    const filteredLogs = useMemo(() => {
        return MOCK_PLATFORM_LOGS.filter((log) => {
            if (filter.type && log.type !== filter.type) return false;
            return true;
        });
    }, [filter]);

    const totalPages = Math.ceil(filteredLogs.length / pageSize);

    const paginatedLogs = useMemo(() => {
        const start = page * pageSize;
        return filteredLogs.slice(start, start + pageSize);
    }, [filteredLogs, page]);

    const updateFilter = (updates: Partial<AuditLogFilter>) => {
        setFilter((previous) => ({ ...previous, ...updates }));
        setPage(0);
    };

    return {
        logs: paginatedLogs,
        filter,
        updateFilter,
        page,
        setPage,
        totalPages
    };
}
