import GlobalToastProvider from '@/components/GlobalToastProvider';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import React, { ReactNode, useEffect, useState, FunctionComponent } from 'react';
type portDef = string | null;
import { useRouter } from 'next/navigation';


interface IProps {
  children: ReactNode;
}

export const SafeHydrate: FunctionComponent<IProps> = ({ children }) => {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}


// @ts-ignore
export const PortContext = React.createContext<[portDef, React.Dispatch<React.SetStateAction<portDef>>]>(null);

export default function App({ Component, pageProps }: AppProps) {
  const portState = useState<portDef>(null);
  const router = useRouter();

  useEffect(() => {
    if (portState[0] == null) router.push("/ports")
  }, [])

  return (
    // <SafeHydrate>
      <GlobalToastProvider>
        <PortContext.Provider value={portState}>
          <Component {...pageProps} />
        </PortContext.Provider>
      </GlobalToastProvider>
    // </SafeHydrate>
  )
}