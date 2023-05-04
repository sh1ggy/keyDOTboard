import React, { ReactNode, useEffect, useState, FunctionComponent } from 'react';
import GlobalToastProvider from '@/components/GlobalToastProvider';
import GlobalErrorProvider from '@/components/GlobalErrorProvider';
import { useRouter } from 'next/navigation';
import '@/styles/globals.css'
import '@/styles/xterm.css'
import type { AppProps } from 'next/app'
import { Card } from '.';
import Head from 'next/head';
type portDef = string | null;
type cardsDef = Card[];

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

// const CARDS_SEED: Card[] = [{
//   name: "Test",
//   password: "passwordle",
//   rfid: "112233"
// }];

// @ts-ignore
export const PortContext = React.createContext<[portDef, React.Dispatch<React.SetStateAction<portDef>>]>(null);
// @ts-ignore
export const LoadedCardsContext = React.createContext<[cardsDef, React.Dispatch<React.SetStateAction<cardsDef>>]>(null);
// @ts-ignore
export const NewCardsContext = React.createContext<[cardsDef, React.Dispatch<React.SetStateAction<cardsDef>>]>(null);

export default function App({ Component, pageProps }: AppProps) {
  const portState = useState<portDef>(null);
  const cardsState = useState<cardsDef>([]);
  const newCardsState = useState<cardsDef>([]);
  const router = useRouter();

  useEffect(() => {
    if (portState[0] == null) router.push("/ports");
  }, [])

  return (
    // <SafeHydrate> Doesnt work lol
    <GlobalToastProvider>
      <GlobalErrorProvider>
        <PortContext.Provider value={portState}>
          <LoadedCardsContext.Provider value={cardsState}>
            <NewCardsContext.Provider value={newCardsState}>
              <Head>
                <script src="http://localhost:8097"></script>
              </Head>
              <Component {...pageProps} />
            </NewCardsContext.Provider>
          </LoadedCardsContext.Provider>
        </PortContext.Provider>
      </GlobalErrorProvider>
    </GlobalToastProvider>
  )
}