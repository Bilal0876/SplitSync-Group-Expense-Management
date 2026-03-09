import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {

    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };

        
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
