import OpenAI from 'openai';
import { client } from './post-conversation.js';

/**
 * Retrieves a specific file from OpenAI.
 *
 * @param fileId - The ID of the file to retrieve.
 * @returns A Promise that resolves to the OpenAI file object.
 * @throws Will throw an error if the file cannot be retrieved.
 */
export const retrieveFile = async (fileId: string): Promise<OpenAI.Files.FileObject> => {
  try {
    const file = await client.files.retrieve(fileId);
    return file;
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw error;
  }
}; 