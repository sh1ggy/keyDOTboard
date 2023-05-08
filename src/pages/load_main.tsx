import CommandTerminal from '@/components/CommandTerminal';
import { useToast } from '@/hooks/useToast';
import { Command } from '@tauri-apps/api/shell';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ActiveView() {
	const [isRunningCommand, setRunningCommand] = useState<boolean>(false);
	const getDataCommand = useRef<Command | null>(null);
	const setToast = useToast();
	const router = useRouter();
	useEffect(() => {
		setToast("Loading the key binary");

		// C:\Users\anhad\AppData\Local\Arduino15\packages\esp32\tools\esptool_py\3.0.0/esptool.exe --chip esp32 --port COM4 --baud 921600 --before default_reset --after hard_reset write_flash -z --flash_mode dio --flash_freq 80m --flash_size detect 0xe000 C:\Users\anhad\AppData\Local\Arduino15\packages\esp32\hardware\esp32\1.0.6/tools/partitions/boot_app0.bin 0x1000 C:\Users\anhad\AppData\Local\Arduino15\packages\esp32\hardware\esp32\1.0.6/tools/sdk/bin/bootloader_qio_80m.bin 0x10000 C:\Users\anhad\AppData\Local\Temp\arduino_build_422462/main_bt.ino.bin 0x8000 C:\Users\anhad\AppData\Local\Temp\arduino_build_422462/main_bt.ino.partitions.bin 

	}, []);

	return (
		<>
			<button
				onClick={() => router.push("/")}
				className="text-gray text-left p-3 mb-24 bg-[#213352] w-full text-[white]">Back
			</button>

			<div className="flex flex-col items-center bg-[#292828] h-full w-full justify-center">
				<div className="justify-center text-4xl animate-pulse items-center rounded-lg text-green-700">
					<strong>Loading login binary!</strong>
				</div>
				<CommandTerminal enabled={isRunningCommand} className="p-6 flex w-auto text-left" commandObj={getDataCommand} />
			</div>
		</>
	)
}