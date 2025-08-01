/**
 * Authentication Routes for Delegate AI
 * =====================================
 * 
 * Handles user registration, login, logout, and token management.
 */

import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, logUserAction } from '../middleware/auth';
import { auth as authMiddleware } from '../middleware/auth';
import { emailService } from '../services/email';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// DEBUG 
router.use((req, res, next) => {
  console.log(`🛎️  authRoutes received → ${req.method} ${req.originalUrl}`);
  next();
});


/**
 * User Registration
 */
router.post('/register', async (req: Request, res: Response) => {
  console.log('🛎️  [Auth] /register hit, body=', req.body); //DEBUG
  try {
    console.log('[Auth] validating input');//DEBUG
    const { email, password, displayName } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    console.log('[Auth] hashing password'); //DEBUG
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('[Auth] password hashed'); //DEBUG
    // Create user
    console.log('[Auth] creating user in DB'); //DEBUG
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: displayName,
        role: 'USER',
        emailVerified: null,
        //isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('[Auth] user created:', user.id);//DEBUG --> NEED TO RUN PRISMA MIGRATE

    // Generate token
    console.log('[Auth] generating token');//DEBUG
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    console.log('[Auth] token generated');//DEBUG
/*
    // Send welcome email
    console.log('[Auth] sending welcome email');//DEBUG
    await emailService.sendWelcomeEmail(user.email, user.name || undefined);
    console.log('[Auth] welcome email sent');//DEBUG

    console.log('[Auth] logging user action');//DEBUG
    await logUserAction(req, 'user_registered', 'auth', {
      userId: user.id,
      email: user.email
    });
     console.log('[Auth] user action logged');//DEBUG*/

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email
    });
    console.log('[Auth] sending response');//DEBUG
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.name,
        role: user.role
      },
      token
    });

  } catch (error) {
    logger.error('Registration failed:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * User Login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true,
        isSuspended: true,
        deletedAt: true,
        emailVerified: true
      }
    });

    if (!user || !user.password) {
      await logUserAction(req, 'login_failed', 'auth', {
        email,
        reason: 'user_not_found'
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active --> NEED TO FIX AFTER DATABASE SET UP
    if (!user.isActive || user.isSuspended || user.deletedAt) {
      await logUserAction(req, 'login_failed', 'auth', {
        userId: user.id,
        email,
        reason: 'account_inactive'
      });

      return res.status(401).json({
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await logUserAction(req, 'login_failed', 'auth', {
        userId: user.id,
        email,
        reason: 'invalid_password'
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginCount: { increment: 1 },
          lastLoginAt: new Date()
          }
      });

      // Log login event
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          ip: req.ip,
          userAgent: req.get('User-Agent') || ''
        }
      });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    await logUserAction(req, 'login_success', 'auth', {
      userId: user.id,
      email
    });

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.name,
        role: user.role,
        emailVerified: user.emailVerified
      },
      token
    });

  } catch (error) {
    logger.error('Login failed:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * Get Current User
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authUser = req.user!;

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.name,
        role: dbUser.role,
        isActive: dbUser.isActive,
        lastLoginAt: dbUser.lastLoginAt
      }
    });

  } catch (error) {
    logger.error('Get current user failed:', error);
    res.status(500).json({
      error: 'Failed to get user information',
      code: 'GET_USER_ERROR'
    });
  }
});

/**
 * Logout
 */
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    await logUserAction(req, 'logout', 'auth', {
      userId: user.id
    });

    logger.info('User logged out', {
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

/**
 * Password Reset Request
 */
router.post('/reset-password-request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Generate reset token (in production, store this securely)
      const resetToken = Math.random().toString(36).substr(2, 15);
      
      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      await logUserAction(req, 'password_reset_requested', 'auth', {
        userId: user.id,
        email
      });
    }

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account with that email exists, a reset link has been sent'
    });

  } catch (error) {
    logger.error('Password reset request failed:', error);
    res.status(500).json({
      error: 'Password reset request failed',
      code: 'RESET_REQUEST_ERROR'
    });
  }
});

export default router;