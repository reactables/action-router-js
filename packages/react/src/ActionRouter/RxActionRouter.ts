import { Reactable, RxBuilder } from "@reactables/core";
import { from, of } from "rxjs";
import { mergeMap, map, catchError } from "rxjs/operators";
import MessageService, {
  ActionResponse,
  ActionPathSchema,
} from "./MessageService";
import z from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

interface ParamConfigTypeString {
  name: string;
  type?: "string";
}

interface ParamConfigTypeEnum {
  name: string;
  type: "enum";
  enumOptions: [string, ...string[]];
}

type ParamConfig = (ParamConfigTypeString | ParamConfigTypeEnum) & {
  isList?: boolean;
};

export interface ActionPath {
  path: string;
  params?: Array<ParamConfig>;
}

/**
 * @description helper method to map action path parameters to json schema
 * for backend to map parameters
 * TODO: Move this logic to backend
 */
const actionPathToSchema = ({
  path,
  params = [],
}: ActionPath): ActionPathSchema => {
  const zodParamsDict = params.reduce((acc, param) => {
    const { name, type = "string", isList } = param;

    const { enumOptions } = param as ParamConfigTypeEnum;

    const zParam =
      type === "string" ? z.string().nullable() : z.enum(enumOptions);

    return { ...acc, [name]: isList ? z.array(zParam) : zParam };
  }, {});

  const responseFormat = zodResponseFormat(
    z.object({
      path: z.literal(path),
      params: z.object(zodParamsDict),
    }),
    `${path}ResponseFormat`
  );

  return {
    path,
    responseFormat,
  };
};

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
  inputValue: "",
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
  const actionPathSchemas = actionPaths.map(actionPathToSchema);

  return RxBuilder({
    initialState,
    reducers: {
      updateInput: (state, action) => ({
        ...state,
        inputValue: action.payload as string,
      }),
      clearInput: (state) => ({ ...state, inputValue: "" }),
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
                    actionPathSchemas,
                  })
                ).pipe(
                  map((response) => ({
                    type: "sendMessageSuccess",
                    payload: response,
                  })),
                  catchError(() => of({ type: "sendMessageFailure" }))
                );
              })
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
