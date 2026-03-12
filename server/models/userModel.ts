import prisma from '../config/prisma.ts';

export interface User {
     id: number;
     username: string;
     email: string;
}

export const createUser = async (name: string, email: string, hash: string) => {
     return await prisma.users.create({
          data: {
               username: name,
               email: email,
               password_hash: hash,
          },
          select: {
               id: true,
               username: true,
               email: true,
          }
     });
}

export const findByemail = async (email: string) => {
     return await prisma.users.findFirst({
          where: {
               email: {
                    equals: email,
                    mode: 'insensitive'
               }
          }
     });
}

