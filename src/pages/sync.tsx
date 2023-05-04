import CommandTerminal from '@/components/CommandTerminal';
import { Command } from '@tauri-apps/api/shell';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function LoginView() {
  const [isRunningCommand, setRunningCommand] = useState<boolean>(false);
  const getDataCommand = useRef<Command | null>(null);

  useEffect(() => {
    // getDataCommand.current.on('close', () => {
    // 	console.log(`Saved BinaryFile in: ${readFileBin}`);
    // 	setToast(`Saved BinaryFile in: ${readFileBin}`);
    // 	setRunningCommand(false);
    // 	router.push("/");
    // })
  }, [])

  return (
    <div className="flex flex-col items-center bg-[#292828] h-screen w-screen justify-center">
      <div className="pt-24 justify-center text-4xl pb-6 items-center text-center rounded-lg text-green-700">
        <p><strong className='animate-pulse select-none text-center'>Saving cards to ESP32!</strong></p>
        <CommandTerminal enabled={isRunningCommand} className="p-6 flex w-auto text-left" commandObj={getDataCommand} />
      </div>
    </div>
  )
}