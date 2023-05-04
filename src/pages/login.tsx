import CommandTerminal from '@/components/CommandTerminal';
import { Command } from '@tauri-apps/api/shell';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function ActiveView() {
	const [isRunningCommand, setRunningCommand] = useState<boolean>(false);
	const getDataCommand = useRef<Command | null>(null);
	const router = useRouter();

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