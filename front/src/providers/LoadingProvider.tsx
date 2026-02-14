import { ReactNode, FC, useState } from "react";
import Loading from "@/components/Loading";
import { LoadingContext } from "./LoagindContext";

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
