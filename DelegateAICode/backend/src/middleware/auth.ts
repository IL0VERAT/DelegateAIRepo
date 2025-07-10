/**
 * AUTHENTICATION MIDDLEWARE
 * =========================
 * 
 * JWT-based authentication middleware with:
 * - Token validation
 * - User context injection
 * - Role-based access control
 * - Session management
 * - Security headers
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { sign, Secret} from 'jsonwebtoken';
import environment from '../config/environment';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        displayName?: string;
        role: string;
        permissions?: string[];
        sessionId?: string;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  displayName?: string;
  role: string;
  permissions?: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract JWT token from request headers
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies (for browser requests)
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  
  return null;
}

/**
 * Verify JWT token and extract user information
 */
function verifyToken(token: string): Promise<JWTPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, environment.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      
      if (!decoded || typeof decoded !== 'object') {
        return reject(new Error('Invalid token payload'));
      }
      
      const payload = decoded as JWTPayload;
      
      // Validate required fields
      if (!payload.userId || !payload.email) {
        return reject(new Error('Invalid token: missing required fields'));
      }
      
      resolve(payload);
    });
  });
}

/**
 * Main authentication middleware
 */
export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path
      });
      
      res.status(401).json({
        error: 'Authentication required',
        message: 'No authentication token provided'
      });
      return;
    }

    try {
      const payload = await verifyToken(token);
      
      // Inject user information into request
      req.user = {
        id: payload.userId,
        email: payload.email,
        displayName: payload.displayName,
        role: payload.role || 'user',
        permissions: payload.permissions || [],
        sessionId: payload.sessionId
      };

      logger.debug('Authentication successful', {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
        path: req.path
      });

      next();
      
    } catch (tokenError) {
      logger.warn('Authentication failed: Invalid token', {
        error: tokenError instanceof Error ? tokenError.message : 'Unknown error',
        ip: req.ip,
        path: req.path
      });
      
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
      return;
    }

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    
    res.status(500).json({
      error: 'Authentication error',
      message: 'Internal authentication error'
    });
    return;
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      try {
        const payload = await verifyToken(token);
        
        req.user = {
          id: payload.userId,
          email: payload.email,
          displayName: payload.displayName,
          role: payload.role || 'user',
          permissions: payload.permissions || [],
          sessionId: payload.sessionId
        };
        
        logger.debug('Optional authentication successful', {
          userId: req.user.id,
          path: req.path
        });
        
      } catch (tokenError) {
        logger.debug('Optional authentication failed, proceeding without user context', {
          error: tokenError instanceof Error ? tokenError.message : 'Unknown error',
          path: req.path
        });
        // Don't set req.user, but continue
      }
    }

    next();
    
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    // Continue without authentication
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRole: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Authorization failed: Insufficient role', {
        userId: req.user.id,
        userRole,
        requiredRole: allowedRoles,
        path: req.path
      });
      
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required role: ${allowedRoles.join(' or ')}`
      });
      return;
    }

    logger.debug('Authorization successful', {
      userId: req.user.id,
      userRole,
      path: req.path
    });

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (requiredPermission: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission) || req.user?.role === 'admin'
    );
    
    if (!hasPermission) {
      logger.warn('Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userPermissions,
        requiredPermissions,
        path: req.path
      });
      
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required permission: ${requiredPermissions.join(' or ')}`
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const logUserAction = async (
  req: Request,
  action: string,
  category: string = 'general',
  details: Record<string, any> = {}
): Promise<void> => {
   const userId = req.user?.id;
  const ip = req.ip;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!ip) {
    throw new Error('Client IP is missing');
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action,
        category,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent') || ''
      }
       // Optionally save details as JSON if you add a `metadata Json?` field to your model
        // metadata: details --> do later

    });
    logger.info('📝 User action logged', { action, userId: req.user?.id });
  } catch (error) {
    logger.warn('⚠️ Failed to write user action log', { error });
  }
};

export const requireAdmin = requireRole('admin');

/**
 * Generate JWT token for user
 */
const jwtOptions: SignOptions = {
  expiresIn: environment.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  issuer: 'delegate-ai',
  audience: 'delegate-ai-users'
};

export const generateToken = (user: {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  permissions?: string[];
  sessionId?: string;
}): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    permissions: user.permissions,
    sessionId: user.sessionId
  };

  return sign(payload, environment.JWT_SECRET as Secret, jwtOptions);
};

/**
 * Refresh token middleware
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
      return;
    }

    // Generate new token
    const newToken = generateToken(req.user);
    
    // Set new token in response header
    res.setHeader('X-New-Token', newToken);
    
    // Also set as cookie if browser request
    if (req.headers.accept?.includes('text/html')) {
      res.cookie('auth_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }

    logger.debug('Token refreshed', {
      userId: req.user.id,
      path: req.path
    });

    next();
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Unable to refresh authentication token'
    });
    return;
  }
};

/**
 * Logout middleware (blacklist token)
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Clear cookie if present
    if (req.cookies && req.cookies.auth_token) {
      res.clearCookie('auth_token');
    }
    
    // In a production system, you would add the token to a blacklist
    // For now, we just clear the cookie and rely on client-side token removal
    
    if (req.user) {
      logger.info('User logged out', {
        userId: req.user.id,
        email: req.user.email
      });
    }

    res.json({
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    logger.error('Logout error:', error);
    
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to complete logout'
    });
  }
};

export default auth;