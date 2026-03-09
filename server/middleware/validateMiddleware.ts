import { Request, Response, NextFunction } from 'express';

export const validateFields = (requiredFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const missingFields: string[] = [];

        for (const field of requiredFields) {
            if (!req.body[field] || req.body[field].toString().trim() === "") {
                missingFields.push(field);
            }
        }

        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        next();
    };
};
