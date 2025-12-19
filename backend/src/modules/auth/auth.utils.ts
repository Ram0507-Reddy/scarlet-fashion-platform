import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../../config/env';

export const generateTokens = (userId: string, role: string) => {
    const accessToken = jwt.sign({ userId, role }, config.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, role }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};
