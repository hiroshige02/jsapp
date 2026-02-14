import { createContext } from "react";

/**
 * ローディング用のstate管理と部品を子コンポーネントに渡す
 */
export type LoadingContextType = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const LoadingContext = createContext<LoadingContextType>({
  setLoading: () => {},
});
