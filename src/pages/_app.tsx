import React, { ReactNode, useEffect, useState, FunctionComponent } from 'react';
import GlobalToastProvider from '@/components/GlobalToastProvider';
import { useRouter } from 'next/navigation';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Card } from '.';
type portDef = string | null;

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

const CARDS_SEED: Card[] = [{
  name: "Test",
  password: "passwordle",
  rfid: "112233"
}];

// @ts-ignore
export const PortContext = React.createContext<[portDef, React.Dispatch<React.SetStateAction<portDef>>]>(null);
// @ts-ignore
export const CardsContext = React.createContext<[Card[], React.Dispatch<React.SetStateAction<Card[]>>]>(null);

export default function App({ Component, pageProps }: AppProps) {
  const portState = useState<portDef>(null);
  const cardsState = useState<Card[]>(CARDS_SEED);
  const router = useRouter();

  useEffect(() => {
    if (portState[0] == null) router.push("/ports");
  }, [])

  return (
    // <SafeHydrate>
    <GlobalToastProvider>
      <PortContext.Provider value={portState}>
        <CardsContext.Provider value={cardsState}>
          <Component {...pageProps} />
        </CardsContext.Provider>
      </PortContext.Provider>
    </GlobalToastProvider>
    // </SafeHydrate>
  )
}