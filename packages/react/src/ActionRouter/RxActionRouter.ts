import { Reactable, RxBuilder } from '@reactables/core';
import { from, of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import MessageService, { ActionResponse } from './MessageService';

interface ParamConfigTypeString {
  name: string;
  type?: 'string';
}

interface ParamConfigTypeEnum {
  name: string;
  type: 'enum';
  enumOptions: [string, ...string[]];
}

type ParamConfig = (ParamConfigTypeString | ParamConfigTypeEnum) & {
  isList?: boolean;
};

export interface ActionPath {
  path: string;
  params?: Array<ParamConfig>;
}

export interface ActionRouterState {
  inputValue: string;
  actionResult: ActionResponse | null;
  sendingMessage: boolean;
  apiError: boolean;
}

export interface ActionRouterActions {
  updateInput: (value: string) => void;
  sendMessage: (message: string) => void;
  reset: () => void;
  clearInput: () => void;
}

const initialState: ActionRouterState = {
  inputValue: '',
  actionResult: null,
  sendingMessage: false,
  apiError: false,
};

export const RxActionRouter = ({
  messageService,
  actionPaths,
}: {
  messageService: MessageService;
  actionPaths: ActionPath[];
}): Reactable<ActionRouterState, ActionRouterActions> => {
  return RxBuilder({
    initialState,
    reducers: {
      updateInput: (state, action) => ({
        ...state,
        inputValue: action.payload as string,
      }),
      clearInput: (state) => ({ ...state, inputValue: '' }),
      sendMessage: {
        reducer: (state) => ({
          ...state,
          sendingMessage: true,
        }),
        effects: [
          (sendMessage$) =>
            sendMessage$.pipe(
              mergeMap((action) => {
                const payload = action.payload as string;
                return from(
                  messageService.postMessage({
                    message: payload,
                    actionPaths,
                  }),
                ).pipe(
                  map((response) => ({
                    type: 'sendMessageSuccess',
                    payload: response,
                  })),
                  catchError(() => of({ type: 'sendMessageFailure' })),
                );
              }),
            ),
        ],
      },
      sendMessageSuccess: (state, action) => ({
        ...state,
        actionResult: action.payload as ActionResponse,
        sendingMessage: false,
        pendingMessage: null,
        apiError: false,
      }),
      sendMessageFailure: (state) => ({
        ...state,
        sendingMessage: false,
        apiError: true,
      }),
      reset: () => initialState,
    },
  });
};
