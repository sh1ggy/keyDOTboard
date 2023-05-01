import { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';

// import { listen } from '@tauri-apps/api/event'
// import { invoke } from '@tauri-apps/api/tauri'
// import { Command } from '@tauri-apps/api/shell'
import { getPorts, reflashPartition, test } from '../services'

import wlogo from '/wlogo.svg'
const saveIcon = '/save.svg'
const eyeOffIcon = '/eyeOff.svg'
const eyeOnIcon = '/eyeOn.svg'

// import { PortSelection } from '@/components/PortSelection'

// import { PortsProps } from './ports'
import { ActiveView } from '@/components/ActiveView'
import { EditView } from '@/components/EditView'
import { CardsViewProps } from '@/components/CardsView'
import { CreateCard } from '@/components/CreateCard'
import { Navbar } from '@/components/Navbar'
import { PortContext } from './_app'
import { useToast } from '@/hooks/useToast';

// interface RFIDPayload {
//   uid: string;
//   error?: string;
// }

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

const CARDS_SEED: Card[] = [{
  name: "Test",
  password: "passwordle",
  rfid: "112233"
}];

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
  const [cards, setCards] = useState<Card[]>([]);

  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [editView, setEditView] = useState(false);
  const [activeView, setActiveView] = useState(false);
  const [index, setIndex] = useState(0);

  const [editPassword, setEditPassword] = useState("");
  const [editName, setEditName] = useState("");

  const [activateToast, setActivateToast] = useState(false);
  // const [toastText, setToastText] = useState("");
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

  // const showToast = useCallback((toastMessage: string) => {
  //   setToastText(toastMessage);
  //   setActivateToast(true);
  //   setTimeout(() => setActivateToast(false), 2000);
  // }, [toastText])

  const createCard = async () => {
    // if (rfid == null) {
    //   showToast("No RFID detected yet");
    //   return;
    // }
    if (createName == "") {
      setToast("Enter name");
      return
    };
    if (createPassword == "") {
      setToast("Enter password");
      return
    };

    const newCard: Card = {
      name: createName,
      password: createPassword,
      rfid: "rfid",
    }
    let exitEarly = false;
    setCards((prev) => {
      // old code to increment the name 
      // const cardName = newCard.name;
      // let newCardName = cardName;

      // for (const card of prev) {
      //   if (cardName == card.name) {
      //     showToast(`Duplicate card name ${cardName}`);

      //     // Handle adding new element by increment
      //     const lastChar = cardName.charAt(cardName.length - 1);
      //     if (/\d/.test(lastChar)) {
      //       cardName.slice(-1);
      //       newCardName = `${cardName}${parseInt(lastChar) + 1}`
      //       console.log("number at the end")
      //     }
      //     else {
      //       newCardName = `${cardName}1`
      //     }

      //     console.log(newCardName);
      //     newCard.name = newCardName;
      //     return [...prev, newCard];
      //   }
      // }

      const cardName = newCard.name;
      for (const card of prev) {
        if (cardName == card.name) {
          console.log("dupe");
          setToast(`Duplicate card name ${cardName}`);
          exitEarly = true;
          return prev;
        }
      }

      const tempCards = [...prev, newCard];
      return tempCards;
    });
    if (exitEarly) return;
    if (await reflashPartition() && !exitEarly) setToast("Card created!");
  }


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

  // TODO: Consider structural change to only be able to edit one card only (maybe modal/edit screen) 
  // in order to not arrive at a race condition of trying to save multiple cards at once
  // Lock access to mutating / clicking edit / deleting any cards when commiting a transaction 
  const saveCard = (i: number) => {
    // await (new Command('sleep', ['ping -n 5 127.0.0.1']));
    setCards((prev) => {
      const editCard: Card = {
        name: editName,
        // Is this the only field that is changing?
        password: editPassword,
        rfid: prev[i].rfid,
      }
      const tempCards = [...prev];
      tempCards.splice(i, 1, editCard);
      setToast("Card saved!");
      setEditView(false);
      return tempCards;
    });
  }

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

  // }

  // const [selectedPort, setSelectedPort] = useState<string | null>("null");
  const [selectedPort, setSelectedPort] = useContext(PortContext);

  return (
    <>
      <Navbar clearData={clearData} syncData={test} />
      <div className={'flex flex-col w-full items-center min-h-screen pb-24 bg-[#292828] overflow-hidden'}>
        {activeView ?
          <ActiveView activeView={activeView} setActiveView={setActiveView} />
          :
          <>
            <CreateCard editView={editView} createCard={createCard} rfid={rfid} setCreateName={setCreateName} setCreatePassword={setCreatePassword} />
            <code onClick={() => { setSelectedPort(null) }} className='mt-24 cursor-pointer transition duration-300 hover:scale-110 bg-[#8F95A0] rounded-lg p-3 mb-3'><strong>Port Selected: </strong>{selectedPort}</code>
            <button className="text-gray text-center p-3 m-3 bg-green-700 rounded-lg text-white"
              onClick={() => setActiveView(!activeView)}>Activate</button>
            <div className='flex flex-row flex-wrap items-center'>
              {editView ?
                <EditView cards={cards} setEditName={setEditName} setEditPassword={setEditPassword} setEditView={setEditView} saveCard={saveCard} index={index} />
                :
                <>
                  {/* {cards.length == 0 ?
                      <div className=" py-24 justify-center w-full h-full rounded-lg text-white">No cards!
                      </div>
                      :
                      <></>
                      // cards.map((c, i) => {
                      //   return (
                      //     <CardsView cards={cards} deleteCard={deleteCard} setEditView={setEditView} setIndex={setIndex} card={c} cardsIndex={i} />
                      //   )
                      // })
                    } */}
                </>
              }
            </div>
          </>
        }
      </div>
    </>
  )
}

export default App
