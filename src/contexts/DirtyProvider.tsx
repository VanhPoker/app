import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

interface DirtyContextType {
  isDirty: boolean;
  setDirty: Dispatch<SetStateAction<boolean>>;
}

const DirtyContext = createContext<DirtyContextType>({
  isDirty: false,
  setDirty: () => {}, 
});

export const useDirty = () => useContext(DirtyContext);

interface DirtyProviderProps {
  children: ReactNode;
}

export const DirtyProvider = ({ children }: DirtyProviderProps) => {
  const [isDirty, setDirty] = useState<boolean>(false);

  return (
    <DirtyContext.Provider value={{ isDirty, setDirty }}>
      {children}
    </DirtyContext.Provider>
  );
};
