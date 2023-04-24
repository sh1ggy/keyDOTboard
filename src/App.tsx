import { useCallback, useEffect, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import wlogo from './assets/wlogo.svg'
import deleteIcon from './assets/delete.svg'
import saveIcon from './assets/save.svg'
import { getPorts, reflashPartition } from './services'
import editIcon from './assets/edit.svg'
import dismissIcon from './assets/dismiss.svg'
import eyeOffIcon from './assets/eyeOff.svg'
import eyeOnIcon from './assets/eyeOn.svg'
import { invoke } from '@tauri-apps/api/tauri'
import { Command } from '@tauri-apps/api/shell'
import { PortSelection } from './components/PortSelection'
import { BaseDirectory, createDir, writeFile } from '@tauri-apps/api/fs';
import { usePersistedState } from './hooks/usePersistedState'


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
  rfid: "632DF01B"
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
  const [cards, setCards] = usePersistedState<Card[]>(CARDS_SEED, "savedCards");

  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [editView, setEditView] = useState(false);
  const [activeView, setActiveView] = useState(false);
  const [index, setIndex] = useState(0);

  const [editPassword, setEditPassword] = useState("");
  const [editName, setEditName] = useState("");
  const [showCreatePassword, setCreateShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [activateToast, setActivateToast] = useState(false);
  const [toastText, setToastText] = useState("");

  useEffect(() => {
    // Listen to tauri events
    const unlistenRFID = listen<string>("rfid", (e) => {
      console.log(e.payload);
      setRfid(e.payload);
    })
    const unlistenError = listen<error>("error", (e) => {
      console.log(e.payload);
      setError(e.payload)
    })

    const init = async () => {
      await sleep(100);
      // Getting cards from local storage
      const localCards = localStorage.getItem("savedCards");
      console.log("GETTING CARDS");
      if (!localCards) {
        console.log("NO CARDS");
        console.log(JSON.stringify(cards));
        setCards([]);
      }
      else {
        console.log("CARDS HERE");
        setCards(JSON.parse(localCards));
        console.log(cards);
      }

    }

    init();
    // setTimeout(() => init(), 2000);

    return (() => {
      // Unsubscribe from tauri events
      unlistenRFID;
      unlistenError;
    })
  }, []);

  const saveCards = useCallback(() => {
    console.log(JSON.stringify(cards));
    localStorage.setItem("savedCards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    saveCards();
  }, [cards])

  useEffect(() => {
    console.log(`Received new rfid ${rfid}`);
  }, [rfid]);

  // const showToast = (toastMessage: string) => {
  //   setToastText(toastMessage);
  //   setActivateToast(true);
  //   setTimeout(() => setActivateToast(false), 2000);
  // }

  const showToast = useCallback((toastMessage: string) => {
    setToastText(toastMessage);
    setActivateToast(true);
    setTimeout(() => setActivateToast(false), 2000);
  }, [toastText])

  const createCard = async () => {
    // if (rfid == null) {
    //   showToast("No RFID detected yet");
    //   return;
    // }
    if (createName == "") {
      showToast("Enter name");
      return
    };
    if (createPassword == "") {
      showToast("Enter password");
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
          showToast(`Duplicate card name ${cardName}`);
          exitEarly = true;
          return prev;
        }
      }

      const tempCards = [...prev, newCard];
      return tempCards;
    });
    if (exitEarly) return;
    if (await reflashPartition() && !exitEarly) showToast("Card created!");
  }


  const deleteCard = async (i: number) => {
    setCards((prev) => {
      const tempCards = [...prev];
      tempCards.splice(i, 1);
      return tempCards;
    })

    if (await reflashPartition())
      showToast("Card deleted");
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
      showToast("Card saved!");
      setEditView(false);
      return tempCards;
    });
  }

  const clearData = async () => {
    // const clearData = await invoke('start_listen_server', { "port": selectedPort });
    await setCards([]);
    localStorage.removeItem("savedCards");
    showToast("Cards cleared!");
  }

  const syncData = async () => {
    // const syncData = await invoke('save_cards_to_csv_command', { cards, port: selectedPort });

    // These commands are executed on `cmd`
    // const binaryCommand = new Command("test", ['/C', 'echo', "hey"]);
    // const binCommandResult = await binaryCommand.execute();
    // console.log({binCommandResult});

    const binaryCommand = new Command("python", ['-c', 'print("hey brother")']);
    const binCommandResult = await binaryCommand.execute();
    console.log({binCommandResult});
    
    // const binaryCommand = new Command(String.raw`C:\Users\anhad\.espressif\python_env\idf5.0_py3.8_env\Scripts\python.exe`,
    //   [String.raw`C:\Users\anhad\esp\esp-idf\components\nvs_flash\nvs_partition_generator\nvs_partition_gen.py`, `generate`, `data.csv`, `data.bin`, `0x5000`]);

    // const binaryChild = await binaryCommand.spawn();
    // const uploadCommand = new Command(
    //   String.raw`C:\Users\anhad\.espressif\python_env\idf5.0_py3.8_env\Scripts\python.exe C:\Users\anhad\esp\esp-idf\components\partition_table\parttool.py`,
    //   [` --port`, `COM4`, `--baud`, `115200`, `write_partition`, `--partition-name=nvs`, `--input`, `"data.bin"`]);

    // binaryCommand.stdout.on('data', line => console.log(`binarycommand stdout: "${line}"`));
    // binaryCommand.stderr.on('data', line => console.log(`binary command stderr: "${line}"`));

    // uploadCommand.stdout.on('data', line => console.log(`uploadcommand stdout: "${line}"`));
    // uploadCommand.stderr.on('data', line => console.log(`uplaodcommand stderr: "${line}"`));

    // binaryCommand.on('close', () => {
    //   uploadCommand.spawn();
    //   console.log("Done");
    // });

    // uploadCommand.on('close', () => {
    //   showToast("Finished saving to disk!");
    // })

  }

  const [selectedPort, setSelectedPort] = useState<string | null>("null");

  return (
    <>
      {/* NAVBAR */}
      <ul className="flex bg-[#8C89AC] py-3 z-10 items-center">
        <li className="text-center flex-1">
          <button className="text-gray text-center p-3 bg-[#292828] rounded-lg text-[white]" onClick={syncData}>Sync</button>
        </li>
        <li className="text-center flex-1">
          <button className="text-gray text-center p-3 bg-[#292828] rounded-lg text-[white]" onClick={async ()=> {
            await invoke("test");
          }}>Test</button>
        </li>

        <li className="flex-1 mr-2">
          <div className="flex-1 flex justify-center mr-auto ml-auto navbar-center">
            <img className='object-contain select-none' src={wlogo} />
          </div>
        </li>
        <li className="text-center flex-1">
          <button className="text-gray text-center p-3 bg-[#292828] rounded-lg text-[white]" onClick={clearData}>Clear Data</button>
        </li>
      </ul>

      {/* TOAST */}
      <div id="toast-default" className={`flex select-none animate-bounce transition-opacity duration-300 fixed bottom-0 right-0 items-center p-4 m-6 text-gray-500 bg-[#8B89AC] rounded-lg ${activateToast ? 'opacity-100' : 'opacity-0'}`} role="alert">
        <div className="alert text-white">
          <div>
            <span>{toastText}</span>
          </div>
        </div>
      </div>

      {selectedPort == null ?
        <PortSelection selectedPort={selectedPort} setSelectedPort={setSelectedPort} setToast={showToast} />
        :
        <div className={'flex flex-col w-full items-center min-h-screen pb-24 bg-[#292828] overflow-hidden'}>
          {activeView ?
            <div className="flex flex-col items-center bg-[#80809D] h-screen w-screen pt-24">
              <div className="pt-24 justify-center text-2xl animate-bounce items-center rounded-lg text-white">Key.board is active
              </div>
              <button className="text-gray text-center p-3 m-3 bg-[#292828] rounded-lg text-white"
                onClick={() => setActiveView(!activeView)}>Edit mode</button>
            </div>
            :
            <>
              <div className='flex flex-col h-full w-screen p-6 items-center bg-[#5D616C]'>
                <code className='bg-[#8F95A0] rounded-lg p-3 mb-3'><strong>UID: </strong>{rfid}</code>
                <input
                  type="text"
                  placeholder="enter name..."
                  disabled={editView}
                  className="input bg-white text-dim-gray py-3 pl-3 pr-16 m-3 rounded-lg"
                  onChange={e => { setCreateName(e.target.value) }}
                />
                <div className='flex flex-row items-center'>
                  <input
                    type={`${showCreatePassword ? 'text' : 'password'}`}
                    placeholder="enter password..."
                    disabled={editView}
                    className="input w-full max-w-xs bg-white text-dim-gray p-3 mb-3 rounded-l-lg"
                    onChange={e => { setCreatePassword(e.target.value) }}
                  />
                  <button
                    disabled={editView}
                    onClick={() => { setCreateShowPassword(!showCreatePassword); }}
                    className="inline-flex text-sm font-medium text-center h-full items-center px-3 py-3 mb-3 text-white rounded-r-lg bg-white">
                    {showCreatePassword ?
                      <img className='object-contain w-6 h-6 items-center' src={eyeOnIcon} />
                      :
                      <img className='object-contain w-6 h-6 items-center' src={eyeOffIcon} />
                    }
                  </button>
                </div>
                <label htmlFor="create-card-modal" className="btn btn-ghost">
                  <button disabled={editView} className="text-gray text-center p-3 m-3 bg-[#292828] rounded-lg text-[white]" onClick={createCard}>Create Card</button>
                </label>

              </div>
              <code onClick={() => { setSelectedPort(null) }} className='mt-24 cursor-pointer transition duration-300 hover:scale-110 bg-[#8F95A0] rounded-lg p-3 mb-3'><strong>Port Selected: </strong>{selectedPort}</code>
              <button className="text-gray text-center p-3 m-3 bg-green-700 rounded-lg text-white"
                onClick={() => setActiveView(!activeView)}>Activate</button>
              <div className='flex flex-row flex-wrap items-center'>
                {editView ?
                  <div className='flex flex-col mt-24 mx-6'>
                    <div className="justify-center text-white text-xl p-6  bg-[#8B89AC] rounded-t-lg" >Editing Card</div>
                    <div className="justify-center text-white p-6 bg-[#5D616C] rounded-b-lg ">
                      <p className="mb-3 text-sm font-bold tracking-tight text-gray-900 dark:text-white">ID: {cards[index].rfid}</p>
                      <input
                        type='text'
                        placeholder={cards[index].name}
                        className="input w-full max-w-xs bg-[#5D616C] text-white text-dim-gray p-3 rounded-lg"
                        onChange={e => { setEditName(e.target.value) }}
                      />
                      <div className='flex flex-row items-center pb-3'>
                        <input
                          type={`${showEditPassword ? 'text' : 'password'}`}
                          placeholder="enter password..."
                          className="input w-full max-w-xs bg-white text-black text-dim-gray p-3 rounded-l-lg"
                          onChange={e => { setEditPassword(e.target.value) }}
                        />
                        <button
                          onClick={() => {
                            setShowEditPassword(!showEditPassword);
                          }}
                          className="inline-flex text-sm font-medium text-center h-full items-center rounded-r-lg text-white bg-white py-3">
                          {showEditPassword ?
                            <img className='object-contain w-6 h-6 items-center' src={eyeOnIcon} />
                            :
                            <img className='object-contain w-6 h-6 items-center' src={eyeOffIcon} />
                          }
                        </button>
                      </div>
                      <button onClick={() => setEditView(false)} className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                        <img className='object-contain w-6 h-6 items-center' src={dismissIcon} />
                      </button>
                      <button onClick={() => saveCard(index)} className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                        <img className='object-contain w-6 h-6 items-center' src={saveIcon} />
                      </button>
                    </div>
                  </div>
                  :
                  cards.length == 0 ?
                    <div className=" py-24 justify-center w-full h-full rounded-lg text-white">No cards!
                    </div>
                    :
                    cards.map((c, i) => {
                      return (
                        <div key={i} className="flex flex-col max-w-sm p-6 bg-[#5D616C] rounded-lg mt-24 mx-6">
                          <div className='flex flex-col items-start'>
                            <p className="mb-3 text-sm font-bold tracking-tight text-gray-900 dark:text-white">ID: {c.rfid}</p>
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{c.name}</h5>
                          </div>
                          <div className='flex flex-row items-end'>
                            <button className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                              <img
                                onClick={() => {
                                  setEditView(true);
                                  setIndex(i);
                                }}
                                className='object-contain w-6 h-6 items-center' src={editIcon} />
                            </button>
                            <button onClick={() => deleteCard(i)} className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                              <img className='object-contain w-6 h-6 items-center' src={deleteIcon} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            </>
          }
        </div>
      }
    </>
  )
}

export default App
