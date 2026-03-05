'use client';

import { useState, useMemo } from 'react';
import type { AuditLogEntry, AuditLogType, AuditLogSortOrder } from '@/features/auditLog/domain/entities/AuditLogEntry';

/**
 * 감사 로그 필터 상태
 */
interface AuditLogFilter {
    startDate: string;
    endDate: string;
    type: AuditLogType | '';
    sortSite: string;
    sortOrder: AuditLogSortOrder;
    searchTerm:string;
}

/**
 * Mock 데이터 — 향후 API 연동 시 이 부분만 교체
 */
const MOCK_PLATFORM_LOGS: AuditLogEntry[] = [
    {
        id: 1, type: 'USER', site: '경복궁',
        action: '관광지 생성', target: 'SITE-001', time: '2026-03-01 10:00:00',
        status: 'success', message: '새로운 관광지 "경복궁"이 생성되었습니다.',
    },
    {
        id: 2, type: 'DEVICE', site: '에버랜드',
        action: '키오스크 연결', target: 'KIOSK-EV-01', time: '2026-03-02 11:30:00',
        status: 'success', message: '에버랜드 정문 키오스크가 서버와 정상적으로 연결되었습니다.',
    },
    {
        id: 3, type: 'SYSTEM', site: '-',
        action: '시스템 백업', target: 'DB_Daily', time: '2026-03-03 09:15:00',
        status: 'success', message: '일일 데이터 백업이 완료되었습니다.',
    },
    {
        id: 4, type: 'USER', site: '롯데월드',
        action: '운영자 초대', target: 'operator@email.com', time: '2026-03-04 14:20:00',
        status: 'success', message: '사이트 관리자 초대가 발송되었습니다.',
    },
    {
        id: 5, type: 'DEVICE', site: '경복궁',
        action: '장애 발생', target: 'KIOSK-006', time: '2026-03-05 16:45:00',
        status: 'warning', message: '네트워크 연결이 지연되고 있습니다.',
    },
    {
        id: 6, type: 'SYSTEM', site: '-',
        action: '백업 완료', target: 'DB_BACKUP', time: '2026-03-06 02:00:00',
        status: 'success', message: '일일 데이터베이스 정기 백업이 성공적으로 수행되었습니다.',
    },
    {
        id: 7, type: 'USER', site: '에버랜드',
        action: '계정 정지', target: 'staff_01', time: '2026-03-07 13:10:00',
        status: 'success', message: '새로운 관광지 "에버랜드"가 생성되었습니다.',
    },
    {
        id: 8, type: 'DEVICE', site: '롯데월드',
        action: '업데이트 실패', target: 'KIOSK-005', time: '2026-03-08 23:50:00',
        status: 'error', message: '롯데월드 매표소 키오스크의 펌웨어 업데이트 중 오류가 발생했습니다.',
    },
    {
        id: 9, type: 'USER', site: '경복궁',
        action: '운영자 초대', target: 'operator@email.com', time: '2026-03-09 10:05:00',
        status: 'success', message: '사이트 관리자 초대가 발송되었습니다.',
    },
    {
        id: 10, type: 'SYSTEM', site: '에버랜드',
        action: 'API 오류', target: 'Zone_API', time: '2026-03-10 15:30:00',
        status: 'error', message: '구역 정보 동기화에 실패했습니다.',
    },
    {
        id: 11, type: 'DEVICE', site: '경복궁',
        action: '센서 오류', target: 'SENSOR-001', time: '2026-03-11 11:20:00',
        status: 'error', message: '센서가 응답하지 않습니다.',
    },
    {
        id: 12, type: 'USER', site: '롯데월드',
        action: '공지사항 등록', target: 'NOTICE-102', time: '2026-03-12 17:00:00',
        status: 'success', message: '주말 야간 개장 관련 공지사항이 게시되었습니다.',
    },
    {
        id: 13, type: 'SYSTEM', site: '-',
        action: 'API 오류', target: 'Zone_API', time: '2026-03-13 04:30:00',
        status: 'error', message: '구역 정보 동기화에 실패했습니다.',
    }
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
        sortSite: '전체',
        sortOrder: 'DESC',
        searchTerm: '',
    });

    //페이지 상태
    const [page, setPage] = useState(0);
    const pageSize = 5;

    const filteredLogs = useMemo(() => {
        let result = MOCK_PLATFORM_LOGS.filter((log) => {
            // 로그 유형 필터
            if (filter.type && log.type !== filter.type) return false;
            // 날짜 필터
            const logDate = log.time.split(' ')[0];
            if (filter.startDate && logDate < filter.startDate) return false;
            if (filter.endDate && logDate > filter.endDate) return false;
            // 장소 필터
            if (filter.sortSite !== '전체') { if (log.site !== filter.sortSite) return false; }
            //검색 필터
            if (filter.searchTerm) {
                const searchLower = filter.searchTerm.toLowerCase();
                const matchesSearch = 
                    (log.site?.toLowerCase().includes(searchLower)) ||
                    (log.action.toLowerCase().includes(searchLower)) ||
                    (log.target.toLowerCase().includes(searchLower)) ||
                    (log.message.toLowerCase().includes(searchLower));
                
                if (!matchesSearch) return false;
            }
            return true;
        });

        result.sort((a, b) => {
            if (filter.sortSite !== '전체') {
                const siteA = a.site || '';
                const siteB = b.site || '';
                const siteComparison = siteA.localeCompare(siteB);
                if (siteComparison !== 0) return siteComparison;
            }
            
            //토글로 시간 정렬은 2순위로 적용시키기
            return filter.sortOrder === 'DESC' ? b.id - a.id : a.id - b.id;
        });

        return result;
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
