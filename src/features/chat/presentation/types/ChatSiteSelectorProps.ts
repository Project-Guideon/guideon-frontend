import type { Site } from '@/features/auth/application/store/AuthContext';

export interface ChatSiteSelectorProps {
    sites: Site[];
    currentSiteId: number | null;
    onSelectSite: (siteId: number) => void;
}
