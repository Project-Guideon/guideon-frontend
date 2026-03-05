'use client';

import { DeleteConfirmDialog } from '@/shared/components/dialog/DeleteConfirmDialog';

interface PlaceDeleteDialogProps {
    isOpen: boolean;
    placeName: string;
    onClose: () => void;
    onConfirm: () => void;
}

/** 장소 삭제 확인 다이얼로그 */
export function PlaceDeleteDialog({ isOpen, placeName, onClose, onConfirm }: PlaceDeleteDialogProps) {
    return (
        <DeleteConfirmDialog
            isOpen={isOpen}
            title="장소 삭제"
            targetName={placeName}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
