import type { Mascot } from '@/features/mascot/domain/entities/Mascot';

export interface MascotTtsCardProps {
    mascot: Mascot;
    siteId: number;
    onCloned: () => Promise<void> | void;
}
