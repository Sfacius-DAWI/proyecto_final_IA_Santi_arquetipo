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
 * Checks the status of a specific run in a thread in OpenAI.
 *
 * @param threadId - The ID of the thread.
 * @param runId - The ID of the run to check.
 * @returns A Promise that resolves to the OpenAI run object with its current status.
 * @throws Will throw an error if the run status cannot be retrieved.
 */
export const statusThread = async (threadId: string, runId: string): Promise<OpenAI.Beta.Threads.Runs.Run> => {
  try {
    let runStatus = await client.beta.threads.runs.retrieve(threadId, runId);
    // Poll for status completion
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      runStatus = await client.beta.threads.runs.retrieve(threadId, runId);
    }
    return runStatus;
  } catch (error) {
    console.error('Error retrieving run status:', error);
    throw error;
  }
}; 