import { Request, Response, NextFunction } from 'express';
import { User, IUser } from './user.model';
import { generateTokens, setAuthCookies } from './auth.utils';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });
        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

        setAuthCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: 'Registered successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            message: 'Logged in successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        const payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
        const user = await User.findById(payload.userId);

        if (!user) return res.status(401).json({ message: 'User not found' });

        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out' });
};

export const me = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({ user });
};
