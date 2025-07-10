/**
 * WebSocket Service for Delegate AI
 * =================================
 * 
 * Handles WebSocket connection management, real-time messaging, and event broadcasting.
 */

import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

let io: SocketIOServer;

/**
 * Initialize WebSocket service
 */
export const initializeWebSocket = (socketServer: SocketIOServer) => {
  try {
    io = socketServer;
    
    logger.info('WebSocket service initialized successfully');
    
    return io;
  } catch (error) {
    logger.error('Failed to initialize WebSocket service:', error);
    throw error;
  }
};

/**
 * Get WebSocket server instance
 */
export const getWebSocketServer = (): SocketIOServer => {
  if (!io) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket() first.');
  }
  return io;
};

/**
 * Broadcast message to all connected clients
 */
export const broadcastToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
    logger.debug('Broadcasting to all clients', { event, dataSize: JSON.stringify(data).length });
  }
};

/**
 * Broadcast message to specific room
 */
export const broadcastToRoom = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data);
    logger.debug('Broadcasting to room', { room, event, dataSize: JSON.stringify(data).length });
  }
};

/**
 * Broadcast message to specific user
 */
export const broadcastToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
    logger.debug('Broadcasting to user', { userId, event, dataSize: JSON.stringify(data).length });
  }
};

/**
 * Get connection statistics
 */
export const getConnectionStats = () => {
  if (!io) {
    return { connectedClients: 0, rooms: [] };
  }

  return {
    connectedClients: io.engine.clientsCount,
    rooms: Array.from(io.sockets.adapter.rooms.keys())
  };
};

/**
 * Health check for WebSocket service
 */
export const checkWebSocketHealth = (): boolean => {
  return !!io && io.engine.clientsCount >= 0;
};

export { io };