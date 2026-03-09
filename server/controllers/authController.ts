import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findByemail } from '../models/userModel.ts';

export const register = async (req: Request, res: Response): Promise<Response> => {
     try {
          const { name, email, password } = req.body;

          // Check if all info is filled
          if (!name || !email || !password) {
               return res.status(400).json({ message: 'Please fill all required fields.' });
          }

          // Check if email is already used
          const userExist = await findByemail(email);
          if (userExist) {
               return res.status(400).json({ message: 'An account with this email already exists.' });
          }

          // Hash password
          const saltRounds = 10;
          const hash = await bcrypt.hash(password, saltRounds);

          // Create user account — createUser returns a single row object
          const newUser = await createUser(name, email, hash);

          // Create JWT token
          const token = jwt.sign(
               { id: newUser.id, email: newUser.email },
               process.env.JWT_SECRET as string,
               { expiresIn: '7d' }
          );

          return res.status(201).json({
               message: "user registration successful",
               token,
               user: { id: newUser.id, email: newUser.email, name: newUser.username },
          });
     } catch (error) {
          console.error('Registration error:', error);
          return res.status(500).json({ message: 'Internal server error.' });
     }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
     try {
          const { email, password } = req.body;

          // Check if all info is filled
          if (!email || !password) {
               return res.status(400).json({ message: 'Please fill all required fields.' });
          }

          // Check if user exists
          const userExist = await findByemail(email);
          if (!userExist) {
               return res.status(401).json({ message: 'Invalid email or password.' });
          }

          // Compare password hash
          const isMatch = await bcrypt.compare(password, userExist.password_hash);
          if (!isMatch) {
               return res.status(401).json({ message: 'Invalid email or password.' });
          }

          // Create JWT token
          const token = jwt.sign(
               { id: userExist.id, email: userExist.email },
               process.env.JWT_SECRET as string,
               { expiresIn: '7d' }
          );

          return res.status(200).json({
               message: "login successful",
               token,
               user: { id: userExist.id, email: userExist.email, name: userExist.username },
          });
     } catch (error) {
          console.error('Login error:', error);
          return res.status(500).json({ message: 'Internal server error.' });
     }
};
