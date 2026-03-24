'use client';

import { DeleteConfirmDialog } from '@/shared/components/dialog/DeleteConfirmDialog';

interface DeviceDeleteDialogProps {
    isOpen: boolean;
    deviceId: string;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * 디바이스 삭제(비활성화) 확인 다이얼로그
 *
 * soft delete — 실제 삭제가 아닌 isActive=false 처리
 */
export function DeviceDeleteDialog({ isOpen, deviceId, onClose, onConfirm }: DeviceDeleteDialogProps) {
    return (
        <DeleteConfirmDialog
            isOpen={isOpen}
            title="디바이스 비활성화"
            targetName={deviceId}
            warningMessage="비활성화된 디바이스는 키오스크 인증이 차단됩니다. 데이터는 유지됩니다."
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
