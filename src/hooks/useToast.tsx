import { ToastContext } from "@/components/GlobalToastProvider";
import { useContext } from "react";

export function useToast() {
    const setToast = useContext(ToastContext);
    return setToast;
}