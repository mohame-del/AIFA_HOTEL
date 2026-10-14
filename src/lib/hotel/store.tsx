import { createContext, useContext, useReducer, type ReactNode } from "react";
import { reducer, type Action } from "./logic";
import { createSeed } from "./seed";
import type { HotelState } from "./types";

const Ctx = createContext<{
  state: HotelState;
  dispatch: (a: Action) => void;
} | null>(null);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeed);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useHotel() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHotel must be used inside HotelProvider");
  return v;
}
