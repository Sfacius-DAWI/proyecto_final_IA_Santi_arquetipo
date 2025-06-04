import OpenAI from 'openai';
import { client } from './post-conversation.js';

/**
 * Runs a specific thread with an assistant in OpenAI.
 *
 * @param assistantId - The ID of the assistant to run the thread with.
 * @param threadId - The ID of the thread to run.
 * @returns A Promise that resolves to the OpenAI run object.
 * @throws Will throw an error if the thread cannot be run.
 */
export const runThread = async (assistantId: string, threadId: string): Promise<OpenAI.Beta.Threads.Runs.Run> => {
  try {
    if (!client) {
      throw new Error('OpenAI client is not available');
    }
    
    const run = await client.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    return run;
  } catch (error) {
    console.error('Error running thread:', error);
    throw error;
  }
};

/**
 * Checks the status of a specific run in a thread in OpenAI, polling until completion.
 *
 * @param threadId - The ID of the thread.
 * @param runId - The ID of the run to check.
 * @returns A Promise that resolves to the OpenAI run object when completed.
 * @throws Will throw an error if the run status cannot be retrieved or if OpenAI client is not available.
 */
export const statusThread = async (threadId: string, runId: string): Promise<OpenAI.Beta.Threads.Runs.Run> => {
  try {
    if (!client) {
      console.error('Error in statusThread: OpenAI client is not available');
      throw new Error('Error in statusThread: OpenAI client is not available');
    }

    while (true) {
      const runRetrieve = await client.beta.threads.runs.retrieve(threadId, runId);
      
      console.log(`Run status: ${runRetrieve.status}`); // Debug logging

      // Estados que indican que el run ha terminado
      if (runRetrieve.status === 'completed' || 
          runRetrieve.status === 'failed' || 
          runRetrieve.status === 'cancelled' || 
          runRetrieve.status === 'expired' ||
          runRetrieve.status === 'requires_action') {
        return runRetrieve;
      }
      
      // Solo continuar el bucle si está en estados de procesamiento
      if (runRetrieve.status === 'queued' || runRetrieve.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 20));
      } else {
        // Estado desconocido, salir del bucle
        console.warn(`Unknown run status: ${runRetrieve.status}`);
        return runRetrieve;
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in statusThread: ' + errorMessage);
    throw new Error('Error in statusThread: ' + errorMessage);
  }
}; 

