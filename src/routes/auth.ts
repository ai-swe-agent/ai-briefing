import { Router, type Request, type Response, type NextFunction } from 'express';
import { createUser, findUserByEmail } from '../models/user.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { ValidationError, UnauthorizedError, AppError } from '../middleware/errorHandler.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface AuthRequestBody {
  email?: string;
  password?: string;
}

interface AuthResponseData {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

function validateAuthInput(body: AuthRequestBody): { email: string; password: string } {
  const { email, password } = body;

  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required');
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  return { email: email.toLowerCase().trim(), password };
}

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = validateAuthInput(req.body as AuthRequestBody);

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(email, hashedPassword);

    const token = signToken({ userId: user.id, email: user.email });

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === '23505') {
      return next(new AppError('Email already registered', 409));
    }
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = validateAuthInput(req.body as AuthRequestBody);

    const user = await findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ userId: user.id, email: user.email });

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      message: 'Login successful',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
