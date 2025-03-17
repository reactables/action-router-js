import React from 'react';
import { ReactNode } from 'react';
import { HookedReactable, useReactable } from '@reactables/react';
import {
  RxActionRouter,
  ActionPath,
  ActionRouterState,
  ActionRouterActions,
} from './RxActionRouter';
import MessageService from './MessageService';
import { RouterStateContext } from './RouterStateContext';
import ActionRouteComponent from './ActionRouteComponent';

export type WithRender = {
  render: (rxActionRouter: HookedRxActionRouter) => ReactNode;
};

export type WithComponent = {
  component: React.JSXElementConstructor<{
    rxActionRouter: HookedRxActionRouter;
  }>;
};

export type ActionRoute = ActionPath & (WithRender | WithComponent);

export type ActionRoutes = Array<ActionRoute>;

export type HookedRxActionRouter = HookedReactable<ActionRouterState, ActionRouterActions>;

const getActionPaths = (actionRoutes: ActionRoutes): Array<ActionPath> => {
  const actionPaths: Array<ActionPath> = actionRoutes
    .filter(({ path }) => {
      return !['notFound'].includes(path);
    })
    .map(({ path, params }) => {
      return {
        path,
        params,
      };
    });

  return actionPaths;
};

/**
 * @description React Hook that receives the list of route configurations
 * and initializes the router.
 */
export const useActionRouter = ({
  actionRoutes,
  messageService,
}: {
  actionRoutes: ActionRoutes;
  messageService: MessageService;
}) => {
  /**
   * Uses Reactable for managing router state
   */
  const rxRouter = useReactable(() =>
    RxActionRouter({
      messageService,
      actionPaths: getActionPaths(actionRoutes),
    }),
  );

  const [routerState, actions] = rxRouter;

  const sendMessage = () => {
    actions.sendMessage(routerState.inputValue);
  };

  /**
   * Create an outlet element that will render
   * the appropriate component view when an action is matched.
   */
  const routerOutlet = (
    <RouterStateContext.Provider value={rxRouter}>
      {actionRoutes.map((route) => (
        <ActionRouteComponent key={route.path} {...route} />
      ))}
    </RouterStateContext.Provider>
  );

  return {
    routerState,
    routerActions: {
      sendMessage,
      updateInput: actions.updateInput,
      clearInput: actions.clearInput,
      reset: actions.reset,
    },
    routerOutlet,
  };
};
