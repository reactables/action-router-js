import React from 'react';
import { RouterStateContext } from './RouterStateContext';
import { useContext } from 'react';
import { ActionRoute } from './useActionRouter';
import { ActionPath } from './RxActionRouter';
import { WithComponent, WithRender } from './useActionRouter';

/**
 * @description Will only render its component in the ActionRoute if
 * if the action router's path matches.
 */
const ActionRouteComponent = (props: ActionRoute) => {
  const rxRouter = useContext(RouterStateContext);
  const { path } = props;

  if (!rxRouter || rxRouter[0] === undefined) return;

  const [state] = rxRouter;

  const { actionResult } = state;

  if (actionResult?.path === path) {
    if ((props as ActionPath & WithRender).render) {
      return <>{(props as ActionPath & WithRender).render(rxRouter)}</>;
    }

    if ((props as ActionPath & WithComponent).component) {
      const Component = (props as ActionPath & WithComponent).component;
      return (
        <>
          <Component rxActionRouter={rxRouter} />
        </>
      );
    }
  }
};

export default ActionRouteComponent;
