export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invite {
    id: number;
    email: string;
    siteName: string;
    siteId: number;
    status: InviteStatus;
    createdAt: string;
    expiresAt: string;
    errorMsg?: string;
}