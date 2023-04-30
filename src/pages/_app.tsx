import GlobalToastProvider from '@/components/GlobalToastProvider';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useEffect, useState } from 'react';
type portDef = string | null;
import { useRouter } from 'next/navigation';

// @ts-ignore
export const PortContext = React.createContext<[portDef, React.Dispatch<React.SetStateAction<portDef>>]>(null);

export default function App({ Component, pageProps }: AppProps) {
  const portState = useState<portDef>(null);
  const router = useRouter();
  
  useEffect(() => {
    if (portState[0] == null) router.push("/ports")
  }, [])

  return (
    <GlobalToastProvider>
      <PortContext.Provider value={portState}>
        <Component {...pageProps} />
      </PortContext.Provider>
    </GlobalToastProvider>
  )
}