import { useEffect, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import wlogo from './assets/wlogo.svg'
import deleteIcon from './assets/delete.svg'
import saveIcon from './assets/save.svg'
import { invoke } from '@tauri-apps/api/tauri'
import { Command } from '@tauri-apps/api/shell'


interface RFIDPayload {
  uid: string;
  error?: string;
}

interface Card {
  name: string;
  password: string;
  rfid: string;
}

interface error {
  title: string;
  message: string;
}


function App() {
  const [rfidPayload, setRfidPayload] = useState<RFIDPayload>({
    uid: "",
    error: "",
  });
  const [error, setError] = useState<error>({
    title: "",
    message: "",
  });
  const cardSeed: Card = {
    name: "Test",
    password: "passwordle",
    rfid: "112233"
  }
  const [cards, setCards] = useState<Card[]>(
    [cardSeed]
  );

  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [password, setPassword] = useState("")
  const [activateToast, setActivateToast] = useState(false);
  const [toastText, setToastText] = useState("");
  useEffect(() => {
    const unlistenRFID = listen<RFIDPayload>("rfid", (e) => {
      console.log(e.payload);
      setRfidPayload(e.payload)
    })
    const unlistenError = listen<error>("error", (e) => {
      console.log(e.payload);
      setError(e.payload)
    })

    const init = async () => {
      const cards = await invoke('get_cards');
    }

    setCards(cards);

    return (() => {
      unlistenRFID;
      unlistenError;
    })
  }, [])

  const showToast = (toastMessage: string) => {
    setToastText(toastMessage);
    setActivateToast(true);
    setTimeout(() => setActivateToast(false), 2000);
  }

  const createCard = () => {
    if (createName == "") {
      showToast("Enter name");
      return
    };
    const newCard: Card = {
      name: createName,
      password: createPassword,
      rfid: rfidPayload.uid,
    }
    setCards((prev) => {
      for (const card of prev) {
        if (newCard.name == card.name) {
          console.log(`new card: ${newCard.name}; prev card: ${card.name}`)
          return prev;
        }
      }
      const tempCards = [...prev, newCard];
      return tempCards;
    });
    showToast("Card created!");
  }

  const deleteCard = (i: number) => {
    setCards((prev) => {
      const tempCards = [...prev];
      tempCards.splice(i, 1);
      showToast("Card deleted");
      return tempCards;
    })
  }

  const saveCard = (i: number) => {
    // await (new Command('sleep', ['ping -n 5 127.0.0.1']));
    setCards((prev) => {
      const editCard: Card = {
        name: prev[i].name,
        password: password,
        rfid: prev[i].rfid,
      }
      const tempCards = [...prev];
      tempCards.splice(i, 1, editCard);
      showToast("Card saved!")
      return tempCards;
    });
  }
  return (
    <>
      {/* NAVBAR */}
      <ul className="flex bg-[#8C89AC] py-3 z-10 items-center">
        <li className="text-center flex-1">
        </li>
        <li className="flex-1 mr-2">
          <div className="flex-1 flex justify-center mr-auto ml-auto navbar-center">
            <img className='object-contain select-none' src={wlogo} />
          </div>
        </li>
        <li className="text-center flex-1">
          <button className="text-gray text-center p-3 bg-[#292828] rounded-lg text-[white]">Clear Data</button>
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

      <div className={'flex flex-col h-screen w-full items-center bg-[#292828]'}>
        <div className='flex flex-col w-screen p-6 items-center bg-[#5D616C]'>
          <code className='bg-[#8F95A0] rounded-lg p-3 mb-3'><strong>UID: </strong>{rfidPayload.uid}</code>
          <input
            type="text"
            placeholder="enter name..."
            className="input w-full max-w-xs bg-white text-dim-gray p-3 m-3 rounded-lg"
            onChange={e => { setCreateName(e.target.value) }}
          />
          <input
            type="password"
            placeholder="enter password..."
            className="input w-full max-w-xs bg-white text-dim-gray p-3 m-3 rounded-lg"
            onChange={e => { setCreatePassword(e.target.value) }}
          />
          <label htmlFor="create-card-modal" className="btn btn-ghost">
            <button className="text-gray text-center p-3 m-3 bg-[#292828] rounded-lg text-[white]" onClick={createCard}>Create Card</button>
          </label>
        </div>
        <div className='flex flex-row flex-wrap items-center'>
          {
            cards.length == 0 ?
              <div className=" py-24 justify-center w-full h-full rounded-lg text-white">No cards!
              </div>
              :
              cards.map((c, i) => {
                return (
                  <div key={i} className="flex flex-col max-w-sm p-6 bg-[#5D616C] rounded-lg mt-24 mx-6">
                    <div className='flex flex-col items-start'>
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{c.name}</h5>
                      <p className="mb-3 text-sm font-bold tracking-tight text-gray-900 dark:text-white">{c.rfid}</p>
                      <input value={password} type="password" onChange={e => { setPassword(e.target.value) }} className="bg-white text-dim-gray p-3 mb-3 rounded-lg font-normal text-gray-700 dark:text-gray-400" />
                    </div>
                    <div className='flex flex-row items-end'>
                      <button className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                        <img onClick={() => saveCard(i)} className='object-contain w-6 h-6 items-center' src={saveIcon} />
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
      </div>
    </>
  )
}

export default App
