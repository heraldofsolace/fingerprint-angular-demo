export interface User {
    id?: string;
    email?: string;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
    token?: string;
    verifiedDevice?: boolean;
}