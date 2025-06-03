import OpenAI from 'openai';
import { client } from './post-conversation.js';

/**
 * Creates a new thread in OpenAI.
 *
 * @returns A Promise that resolves to the OpenAI thread object ID.
 * @throws Will throw an error if the thread cannot be created.
 */
export const addThread = async (): Promise<string> => {
  try {
    const thread = await client.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}; 