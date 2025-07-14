import { Prisma, PrismaClient, CharacterType,SessionStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { geminiService } from './gemini'

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
        scenarioId,
        name: character.name || 'Unnamed Player',
        content: character,          // Json column
        traits: character.traits || {}, 
        type: CharacterType.PLAYER
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
  sessionId: string
): Promise<void> => {
  try {
    const data = characters.map(c => ({
      userId,
      scenarioId,
      sessionId,
      traits: c.traits || {},
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
  data: { transcript: any; response: any; timestamp: Date; }
): Promise<void> => {
  try {

     // let Gemini detect the language…
    const language = await geminiService.detectLanguage(data.transcript)
      .catch(err => {
        logger.warn('Language detection failed, defaulting to "und":', err)
        return 'und'  // und = undetermined
      })

    await prisma.transcript.create({
      data: {
        userId,
        sessionId,
        content: {
          transcript: data.transcript,
          response: data.response,
          timestamp: data.timestamp
        },
        originalText: data.transcript,
        cleanedText:  data.response,
        language, 
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
  sessionData: { recordings?: any; status?: string }
): Promise<void> => {
  try {

    let statusUpdate:
      | { status: SessionStatus }
      | Record<string, never> = {}

    if (
      sessionData.status &&
      Object.values(SessionStatus).includes(
        sessionData.status as SessionStatus
      )
    ) {
      statusUpdate = { status: sessionData.status as SessionStatus }
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        recordings: sessionData.recordings,
        ...statusUpdate
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
): Promise<{ recordings: any; transcripts: any[] } | null> => {
  try {
    return await prisma.session.findFirst({
      where: { id: sessionId, userId },
      select: {
        recordings: true,      // JSON column
        transcripts: true      // relation field
      }
    });
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
  await prisma.playerChoice.create({
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
      skip: options.offset,
      select: {
        id: true,
        campaignId: true,
        startedAt: true,
        endedAt: true,
        recordings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return sessions;
  } catch (error) {
    logger.error('Failed to get campaign history:', error);
    throw error;
  }
};