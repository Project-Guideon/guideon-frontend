export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invite {
    inviteId: number;
    siteId: number;
    siteName: string;
    email: string;
    role: string;
    status: InviteStatus;
    expiresAt: string;
    createdAt: string;
}
