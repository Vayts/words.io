import { Response } from 'express';
import jwt from 'jsonwebtoken';

export function getRandomNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function analyseWord(userWord: string, word: string): Record<string, number[]> {
  const result: { partialMatch: number[]; fullMatch: number[] } = {
    partialMatch: [],
    fullMatch: [],
  };
  userWord.split('').forEach((el: string, index: number) => {
    if (word.includes(el.toLowerCase()) && word[index] !== el.toLowerCase()) {
      result.partialMatch.push(index);
    }
    if (word[index] === el.toLowerCase()) {
      result.fullMatch.push(index);
    }
  });
  return result;
}

export function generateJWT(res: Response, userId: string, userLogin: string) {
  const token = jwt.sign({ id: userId, login: userLogin }, <string>process.env.JWT_SECRET, {
    expiresIn: Number(process.env.JWT_EXPIRES) * 24 * 60 * 60 * 1000,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + Number(process.env.JWT_EXPIRES) * 24 * 60 * 60 * 1000),
    httponly: true,
  };

  res.cookie('jwt', token, cookieOptions);
}
