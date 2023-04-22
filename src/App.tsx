import { useEffect, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import logo from './assets/logo.svg'
import wlogo from './assets/wlogo.svg'
import styles from "./index.css"

interface RFID {
  uid?: string;
  message?: string;
}

function App() {
  const [rfid, setRfid] = useState<RFID>({});

  const fetchRFID = () => {
    const placeholder = '22 44 9C 0B'
    const message = 'Authorised access'
    const rfidInfo: RFID = {
      uid: placeholder, 
      message: message,
    };
    
    setRfid(rfidInfo);
  }
  useEffect(() => {
    fetchRFID();
  }, [])
  return (
    <div className='flex h-full w-full bg-slate'>
      <img className='object-contain h-full w-full select-none bg-white' src={wlogo} />
      <div>
        <div className='flex flex-row bg-saffron p-96'>
          <p>{rfid.uid}</p>
          <p>{rfid.message}</p>
        </div>
      </div>
    </div>
  )
}

export default App
