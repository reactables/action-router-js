import { ActionPath } from './RxActionRouter';

export interface PostMessagePayload<T extends Array<ActionPath>> {
  message: string;
  actionPaths: T;
}

export interface ActionResponse {
  path: string;
  params: Record<string, string | string[]> | null;
  originalMessage: string;
}

class MessageService {
  postMessage<T extends Array<ActionPath>>(payload: PostMessagePayload<T>) {
    return fetch('http://localhost:8000/action-router/get-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((response) => response.json() as Promise<ActionResponse>);
  }
}

export default MessageService;
