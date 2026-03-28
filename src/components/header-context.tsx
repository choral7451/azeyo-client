"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const HeaderExtraContext = createContext<{
  stickyExtra: ReactNode;
  setStickyExtra: (node: ReactNode) => void;
}>({
  stickyExtra: null,
  setStickyExtra: () => {},
});

export function HeaderExtraProvider({ children }: { children: ReactNode }) {
  const [stickyExtra, setStickyExtra] = useState<ReactNode>(null);
  return (
    <HeaderExtraContext.Provider value={{ stickyExtra, setStickyExtra }}>
      {children}
    </HeaderExtraContext.Provider>
  );
}

export function useHeaderExtra() {
  return useContext(HeaderExtraContext);
}
