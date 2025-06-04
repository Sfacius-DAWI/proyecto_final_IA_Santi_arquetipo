import OpenAI from 'openai';
import { client } from './post-conversation.js';
import { ChatInterface } from '../../types/general-AI-request.interface.js';

/**
 * Adds a message to a specific thread in OpenAI.
 *
 * @param chatrequest - The chat request containing the prompt.
 * @param threadId - The ID of the thread to add the message to.
 * @returns A Promise that resolves to the OpenAI message object.
 * @throws Will throw an error if the message cannot be added.
 */
export const addMessage = async (chatrequest: ChatInterface, threadId: string): Promise<OpenAI.Beta.Threads.Messages.Message> => {
  try {
    const message = await client.beta.threads.messages.create(threadId, {
      role: 'user',
      content: chatrequest.prompt
    });
    return message;
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw error;
  }
};

/**
 * Retrieves all messages from a specific thread in OpenAI.
 *
 * @param threadId - The ID of the thread to retrieve messages from.
 * @returns A Promise that resolves to the list of OpenAI message objects.
 * @throws Will throw an error if messages cannot be retrieved.
 */
export const getMessage = async (threadId: string): Promise<OpenAI.Beta.Threads.Messages.MessagesPage> => {
  try {
    const messages = await client.beta.threads.messages.list(threadId);
    return messages;
  } catch (error) {
    console.error('Error retrieving messages from thread:', error);
    throw error;
  }
}; 