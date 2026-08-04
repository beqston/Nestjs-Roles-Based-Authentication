declare global {
  namespace Express {
    interface Request {
      refreshToken?: string;
    }
  }
}

export {};