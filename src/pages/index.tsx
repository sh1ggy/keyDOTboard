import { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

// import { listen } from '@tauri-apps/api/event'
// import { invoke } from '@tauri-apps/api/tauri'
// import { Command } from '@tauri-apps/api/shell'
import { getPorts, reflashPartition, test } from '../services'
import { CardsView, CardsViewProps } from '@/components/CardsView'
import { Navbar } from '@/components/Navbar'
import { CardsContext, PortContext, SyncContext } from './_app'
import { useToast } from '@/hooks/useToast';
import { EditView } from '@/components/EditView';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

  const [rfid, setRfid] = useState<string | null>(null);
  // const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);

  const [editPassword, setEditPassword] = useState("");
  const [editName, setEditName] = useState("");
  const [cards, setCards] = useContext(CardsContext);

  const setToast = useToast();
  const router = useRouter();

  useEffect(() => {
    // Listen to tauri events
    // const unlistenRFID = listen<string>("rfid", (e) => {
    //   console.log(e.payload);
    //   setRfid(e.payload);
    // })
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


  useEffect(() => {
  }, [cards])

  useEffect(() => {
    console.log(`Received new rfid ${rfid}`);
  }, [rfid]);

  // const createCard = async (name: string, password: string) => {
  //   // if (rfid == null) {
  //   //   showToast("No RFID detected yet");
  //   //   return;
  //   // }
  //   if (createName == "") {
  //     setToast("Enter name");
  //     return
  //   };
  //   if (createPassword == "") {
  //     setToast("Enter password");
  //     return
  //   };

  //   const newCard: Card = {
  //     name: createName,
  //     password: createPassword,
  //     rfid: "rfid",
  //   }
  //   let exitEarly = false;
  //   setCards((prev) => {
  //     const cardName = newCard.name;
  //     for (const card of prev) {
  //       if (cardName == card.name) {
  //         console.log("dupe");
  //         setToast(`Duplicate card name ${cardName}`);
  //         exitEarly = true;
  //         return prev;
  //       }
  //     }
  //     const tempCards = [...prev, newCard];
  //     return tempCards;
  //   });
  //   if (exitEarly) return;
  //   if (await reflashPartition() && !exitEarly) setToast("Card created!");
  // }


  const deleteCard = async (i: number) => {
    setCards((prev) => {
      const tempCards = [...prev];
      tempCards.splice(i, 1);
      return tempCards;
    })

    if (await reflashPartition())
      setToast("Card deleted");
  }

  // TODO: retry flash button
  

  const clearData = async () => {
    // const clearData = await invoke('start_listen_server', { "port": selectedPort });
    await setCards([]);
    setToast("Cards cleared!");
  }

  // const syncData = async () => {
  //   const syncData = await invoke('save_cards_to_csv_command', { cards, port: selectedPort });
  //   await sleep(200);
  //   const binaryCommand = new Command(String.raw`C:\Users\anhad\.espressif\python_env\idf5.0_py3.8_env\Scripts\python.exe`,
  //     [String.raw`C:\Users\anhad\esp\esp-idf\components\nvs_flash\nvs_partition_generator\nvs_partition_gen.py`, `generate`, `data.csv`, `data.bin`, `0x5000`]);

  //   const binaryChild = await binaryCommand.spawn();
  //   const uploadCommand = new Command(
  //     String.raw`C:\Users\anhad\.espressif\python_env\idf5.0_py3.8_env\Scripts\python.exe C:\Users\anhad\esp\esp-idf\components\partition_table\parttool.py`,
  //     [` --port`, `COM4`, `--baud`, `115200`, `write_partition`, `--partition-name=nvs`, `--input`, `"data.bin"`]);

  //   binaryCommand.stdout.on('data', line => console.log(`binarycommand stdout: "${line}"`));
  //   binaryCommand.stderr.on('data', line => console.log(`binary command stderr: "${line}"`));

  //   uploadCommand.stdout.on('data', line => console.log(`uploadcommand stdout: "${line}"`));
  //   uploadCommand.stderr.on('data', line => console.log(`uplaodcommand stderr: "${line}"`));

  //   binaryCommand.on('close', () => {
  //     uploadCommand.spawn();
  //     console.log("Done");
  //   });

  //   uploadCommand.on('close', () => {
  //     setToast("Finished saving to disk!");
  //   })
  //   TODO: set sync state to false here to stop bouncy!
  //   setSync(false);
  // }

  const [selectedPort, setSelectedPort] = useContext(PortContext);
  const [editView, setEditView] = useState(false);
  const [sync, setSync] = useContext(SyncContext);

  return (
    <>
      <Navbar />
      <div className={'flex flex-col w-full items-center min-h-screen bg-[rgb(41,40,40)] overflow-hidden'}>
        <div className="flex flex-col w-full items-center p-9 bg-[#5D616C] rounded-b-lg">
          <div className='flex flex-row my-8'>
            <code
              onClick={() => {
                setSelectedPort(null);
                router.push('/ports');
              }}
              className='cursor-pointer transition duration-300 hover:scale-105 bg-[#8F95A0] p-3 rounded-lg'>
              <strong>Port Selected: </strong>{selectedPort}
            </code>
            <button className="text-gray cursor-pointer transition duration-300 hover:scale-105 text-center p-3 ml-5 bg-green-700 rounded-lg text-white"
              onClick={() => {
                router.push('/active');
              }}>
              Activate
            </button>
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
                onClick={test}
                className={`${sync ? 'animate-bounce' : ''} text-gray text-center h-full p-3 m-3 bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 rounded-lg text-[white]`}>
                Sync
              </button>
              <button
                onClick={clearData}
                className="text-gray text-center h-full p-3 m-3 text-[white]  bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" >
                Clear Data
              </button>
            </div>
          </div>
        </div>
        <div className='flex flex-row flex-wrap items-center'>
          {cards.length == 0 ?
            <div className="pt-24 text-white">No cards!
            </div>
            :
            <>
              {editView ?
                <EditView
                  setEditView={setEditView}
                  index={index}
                  editView={editView}
                />
                :
                <>
                  {cards.map((c, i) => {
                    return (
                      <CardsView key={i} cards={cards} deleteCard={deleteCard} setIndex={setIndex} card={c} cardsIndex={i} setEditView={setEditView} editView={editView} />
                    )
                  })}
                </>
              }
            </>
          }
        </div>
      </div>
    </>
  )
}

export default App
