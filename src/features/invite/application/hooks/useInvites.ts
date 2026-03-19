import { useState, useEffect } from 'react';
import { Invite } from '../../domain/entities/InviteEntry';

export function useInvites() {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInvites = async () => {
            setIsLoading(true);
            try {
                const realisticMockData: Invite[] = [
                    { id: 1, email: 'kim_manager@jeju.resort.com', siteName: '제주 만장굴', siteId: 101, status: 'ACCEPTED', createdAt: '2024-03-01', expiresAt: '2024-03-08' },
                    { id: 2, email: 'lee_staff@palace.seoul.kr', siteName: '경복궁', siteId: 102, status: 'PENDING', createdAt: '2024-03-15', expiresAt: '2024-03-22' },
                    { id: 3, email: 'park_op@bulguksa.or.kr', siteName: '불국사', siteId: 103, status: 'EXPIRED', createdAt: '2024-02-20', expiresAt: '2024-02-27' },
                    { id: 4, email: 'admin_support@tour.gangwon.kr', siteName: '남이섬', siteId: 104, status: 'REVOKED', createdAt: '2024-03-05', expiresAt: '2024-03-12' },
                    { id: 5, email: 'wrong_mail@invalid-domain.com', siteName: '제주 만장굴', siteId: 101, status: 'EXPIRED', createdAt: '2024-03-10', expiresAt: '2024-03-17', errorMsg: '발송 실패: 주소 형식 오류' },
                    { id: 6, email: 'choi_master@namsantower.co.kr', siteName: 'N서울타워', siteId: 105, status: 'ACCEPTED', createdAt: '2024-03-02', expiresAt: '2024-03-09' },
                    { id: 7, email: 'han_guide@lotteworld.com', siteName: '롯데월드', siteId: 106, status: 'PENDING', createdAt: '2024-03-18', expiresAt: '2024-03-25' },
                    { id: 8, email: 'seo_manager@everland.co.kr', siteName: '에버랜드', siteId: 107, status: 'PENDING', createdAt: '2024-03-18', expiresAt: '2024-03-25' },
                    { id: 9, email: 'it_support@busan.tower.kr', siteName: '부산타워', siteId: 108, status: 'EXPIRED', createdAt: '2024-02-15', expiresAt: '2024-02-22' },
                    { id: 10, email: 'jung_admin@sokcho.sea.kr', siteName: '속초 해수욕장', siteId: 109, status: 'REVOKED', createdAt: '2024-03-12', expiresAt: '2024-03-19' },
                    { id: 11, email: 'mail_error@server.com', siteName: '경복궁', siteId: 102, status: 'EXPIRED', createdAt: '2024-03-14', expiresAt: '2024-03-21', errorMsg: '발송 실패: SMTP 서버 거부' },
                    { id: 12, email: 'kang_op@suwon.fortress.kr', siteName: '수원 화성', siteId: 110, status: 'ACCEPTED', createdAt: '2024-03-05', expiresAt: '2024-03-12' },
                    { id: 13, email: 'yu_staff@hanok.village.kr', siteName: '전주 한옥마을', siteId: 111, status: 'PENDING', createdAt: '2024-03-17', expiresAt: '2024-03-24' },
                    { id: 14, email: 'temp_user@naver.com', siteName: '불국사', siteId: 103, status: 'EXPIRED', createdAt: '2024-02-28', expiresAt: '2024-03-06' },
                    { id: 15, email: 'master@ocean.world.kr', siteName: '오션월드', siteId: 112, status: 'ACCEPTED', createdAt: '2024-03-08', expiresAt: '2024-03-15' },
                ];
                setInvites(realisticMockData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvites();
    }, []);

    const cancelInvite = (id: number) => {
        setInvites(prev => prev.map(inv => 
            inv.id === id ? { ...inv, status: 'REVOKED' } : inv
        ));
    };

    const resendInvite = (id: number) => {
        setInvites(prev => prev.map(inv => 
            inv.id === id ? { 
                ...inv, 
                status: 'PENDING', 
                createdAt: new Date().toISOString(),
                errorMsg: undefined 
            } : inv
        ));
    };

    return { invites, isLoading, cancelInvite, resendInvite };
}