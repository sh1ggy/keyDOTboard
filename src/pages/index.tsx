import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation';

// import { listen } from '@tauri-apps/api/event'
// import { invoke } from '@tauri-apps/api/tauri'
// import { Command } from '@tauri-apps/api/shell'
import { getPorts, reflashPartition, test } from '@/lib/services'
import { CardsView, CardsViewProps } from '@/components/CardsView'
import { Navbar } from '@/components/Navbar'
import { LoadedBinaryContext, LoadedCardsContext, NewCardsContext, PortContext } from './_app'
import { useToast } from '@/hooks/useToast';
import { arraysEqual } from '@/lib/utils';
import { LoadedBinaryState } from './_app';


export interface Card {
  name: string;
  password: string;
  rfid: string;
}

interface error {
  title: string;
  message: string;
}


function App() {
  // const [rfidPayload, setRfidPayload] = useState<RFIDPayload>({
  //   uid: "",
  //   error: "",
  // });
  const [error, setError] = useState<error>({
    title: "",
    message: "",
  });
  const setToast = useToast();
  const router = useRouter();
  const [selectedPort, setSelectedPort] = useContext(PortContext);
  const [cards, setCards] = useContext(LoadedCardsContext);
  const [newCards, setNewCards] = useContext(NewCardsContext);
  const [binary, setBinary] = useContext(LoadedBinaryContext);

  useEffect(() => {
    // Listen to tauri events

    // const unlistenError = listen<error>("error", (e) => {
    //   console.log(e.payload);
    //   setError(e.payload)
    // })

    // setTimeout(() => init(), 2000);

    return (() => {
      // Unsubscribe from tauri events
      // unlistenRFID;
      // unlistenError;
    })
  }, []);

  const sync = useMemo(() => {
    return !arraysEqual(newCards, cards);
  }, [newCards, cards]);


  const clearData = async () => {
    // const clearData = await invoke('start_listen_server', { "port": selectedPort });
    // await setCards([]);
    setToast("Cards cleared!");
  }

  return (
    <>
      <Navbar />
      <div className={'flex flex-col w-full items-center min-h-screen bg-[rgb(41,40,40)] overflow-hidden'}>
        <div className="flex flex-col w-full items-center p-9 bg-[#5D616C] rounded-b-lg">
          <code className='bg-[#373a41] p-3 rounded-lg text-[#F7C546]'>
            <strong>Loaded Binary: {binary == LoadedBinaryState.Unknown ? "N/A" : LoadedBinaryState[binary]}</strong>
          </code>
          <div className='flex flex-row my-8'>
            <code
              onClick={() => {
                setSelectedPort(null);
                router.push('/ports');
              }}
              className='cursor-pointer transition duration-300 hover:scale-105 bg-[#8F95A0] p-3 rounded-lg'>
              <strong>Port Selected: </strong>{selectedPort}
            </code>
            {binary != LoadedBinaryState.Main &&
              <>
                <button
                  className="text-gray cursor-pointer transition duration-300 hover:scale-105 text-center p-3 ml-5 bg-[#18a04aee] rounded-lg text-white"
                  onClick={() => {
                    router.push('/login');
                  }}>
                  Load Login Binary
                </button>
              </>
            }
          </div>
          <div className='flex flex-col'>
            <button className="text-gray cursor-pointer transition duration-300 hover:scale-105 ext-center p-3 m-3 bg-[#292828] rounded-lg text-white"
              onClick={() => {
                router.push('/create');
              }}>
              Create Card
            </button>
            <div className='flex flex-row'>
              <button
                onClick={() => { router.push("/sync") }}
                className={`${sync ? 'animate-bounce' : ''} text-gray text-center h-full p-3 m-3 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 rounded-lg text-[white]`}>
                Sync
              </button>
              <button
                onClick={clearData}
                className="text-gray text-center h-full p-3 m-3 text-[white]  bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" >
                Reset Changes
              </button>
            </div>
          </div>
        </div>
        <div className='flex flex-row flex-wrap items-center pb-24'>
          {newCards.length == 0 ?
            <div className="pt-24 text-white">No cards!
            </div>
            :
            <div className='flex flex-wrap items-center justify-center'>
              {newCards.map((c, i) => {
                return (
                  <CardsView key={i} card={c} cardIndex={i} />
                )
              })}
            </div>
          }
        </div>
      </div >
    </>
  )
}

export default App
