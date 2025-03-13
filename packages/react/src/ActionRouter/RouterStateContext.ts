import { createContext } from "react";
import { HookedRxActionRouter } from "./useActionRouter";

export const RouterStateContext = createContext<
  HookedRxActionRouter | undefined
>(undefined);
