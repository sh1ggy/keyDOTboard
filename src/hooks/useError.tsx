
import { ErrorContext } from "@/components/GlobalErrorProvider";
import { useContext, memo } from "react";

export function useError() {
  const setError = useContext(ErrorContext);
  return setError;
}
