'use client';

import { DeleteConfirmDialog } from '@/shared/components/dialog/DeleteConfirmDialog';

interface ZoneDeleteDialogProps {
    isOpen: boolean;
    zoneName: string;
    hasSubZones: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * 구역 삭제 확인 다이얼로그
 *
 * INNER 삭제 시 하위 SUB도 함께 삭제됨을 경고합니다.
 */
export function ZoneDeleteDialog({ isOpen, zoneName, hasSubZones, onClose, onConfirm }: ZoneDeleteDialogProps) {
    return (
        <DeleteConfirmDialog
            isOpen={isOpen}
            title="구역 삭제"
            targetName={zoneName}
            warningMessage={hasSubZones ? '⚠️ 하위 구역(SUB)도 함께 삭제됩니다' : undefined}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
