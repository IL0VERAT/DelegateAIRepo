import { Prisma, PrismaClient, CharacterType } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Save the player character to the database.
 */
export const savePlayerCharacter = async (
  userId: string,
  scenarioId: string,
  character: any,
  sessionId: string,
): Promise<void> => {
  try {
    await prisma.character.create({
      data: {
        userId,
        sessionId,
        name: character.name || 'Unnamed Player',
        //scenarioId,
        content: character,
        traits: character.traits || {},
        type: 'PLAYER'
      }
    });
  } catch (error) {
    logger.error('Failed to save player character:', error);
    throw error;
  }
};

/**
 * Save generated AI characters to the database.
 */
export const saveAICharacters = async (
  userId: string,
  scenarioId: string,
  characters: any[],
  traits: Record<string, any>,
  sessionId: string
): Promise<void> => {
  try {
    const data = characters.map(c => ({
      userId,
      //scenarioId,
      sessionId,
      traits,
      name: c.name || 'Unnamed AI',
      content: c,
      type: CharacterType.AI
    }));

    await prisma.character.createMany({ data });
  } catch (error) {
    logger.error('Failed to save AI characters:', error);
    throw error;
  }
};

/**
 * Save a generated crisis to the database.
 */
export const saveCrisis = async (
  userId: string,
  sessionId: string,
  crisis: any
): Promise<void> => {
  try {
    await prisma.crisis.create({
      data: {
        userId,
        sessionId,
        content: crisis
      }
    });
  } catch (error) {
    logger.error('Failed to save crisis:', error);
    throw error;
  }
};

/**
 * Save a player interaction to the transcript.
 */
export const savePlayerInteraction = async (
  userId: string,
  sessionId: string,
  data: { transcript: any; response: any; timestamp: Date }
): Promise<void> => {
  try {
    await prisma.transcript.create({
      data: {
        userId,
        sessionId,
        content: {
          transcript: data.transcript,
          response: data.response,
          timestamp: data.timestamp
        }
      }
    });
  } catch (error) {
    logger.error('Failed to save player interaction:', error);
    throw error;
  }
};

/**
 * Save a campaign session's state.
 */
export const saveCampaignSession = async (
  userId: string,
  sessionId: string,
  sessionData: any
): Promise<void> => {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        transcript: sessionData.transcript,
        recordings: sessionData.recordings,
        status: sessionData.status || 'ACTIVE',
        updatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Failed to save campaign session:', error);
    throw error;
  }
};

/**
 * Load a campaign session's data.
 */
export const loadCampaignSession = async (
  userId: string,
  sessionId: string
): Promise<any> => {
  try {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
      include: {
        Transcript: true
      }
    });

    return session;
  } catch (error) {
    logger.error('Failed to load campaign session:', error);
    throw error;
  }
};

/**
 * Saves the choices the player makes in campaigns to database
 */
export async function savePlayerChoice(
  userId: string,
  sessionId: string,
  data: {
    choice: string;
    result: any;
    createdAt: Date;
  }
): Promise<void> {
  await Prisma.playerChoice.create({
    data: {
      userId,
      sessionId,
      choice: data.choice,
      result: data.result,
      createdAt: data.createdAt
    }
  });
}

/**
 * Get campaign history for a user.
 */
export const getCampaignHistory = async (
  userId: string,
  options: { limit: number; offset: number }
): Promise<any[]> => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset
    });

    return sessions;
  } catch (error) {
    logger.error('Failed to get campaign history:', error);
    throw error;
  }
};