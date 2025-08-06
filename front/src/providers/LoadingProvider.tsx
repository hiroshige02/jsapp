import { createContext, ReactNode, FC, useState } from "react";
import Loading from "@/components/Loading";

/**
 * ローディング用のstate管理と部品を子コンポーネントに渡す
 */
export type LoadingContextType = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const LoadingContext = createContext<LoadingContextType>({
  setLoading: () => {},
});

export const LoadingProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const value = { setLoading };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && <Loading />}
    </LoadingContext.Provider>
  );
};
