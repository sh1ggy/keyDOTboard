import { useContext, useEffect, useRef, useState } from "react";
import { getCurrentWorkingDir, getEspBinDir, getPorts, startImports, startlistenServer } from "../services";
import { PortContext } from "./_app";
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import React from "react";
import CommandTerminal from "@/components/CommandTerminal";
import type { Command } from '@tauri-apps/api/shell';

export default function PortSelection() {
	const [ports, setPorts] = useState<string[]>([]);
	const [selectedPort, setSelectedPort] = useContext(PortContext);
	const setToast = useToast();
	const router = useRouter();
	const getDataCommand = useRef<Command | null>(null);

	useEffect(() => {
		const init = async () => {
			await startImports();
			const recvPorts = await getPorts();
			setPorts(recvPorts);
			setSelectedPort(recvPorts[0]);
		}
		init();
	}, [])

	const savePort = async () => {

		if (selectedPort == null) return;
		await startlistenServer(selectedPort);

		setSelectedPort(selectedPort);
		setToast("Connecting to device at port: " + selectedPort);

		const espBin = await getEspBinDir();

		const Command = (await import('@tauri-apps/api/shell')).Command;
		getDataCommand.current = Command.sidecar('parttool', [`-e`, `${espBin}`, `--port`, `COM4`, `--baud`, `115200`, `write_partition`, `--partition-name=nvs`, `--input`, `"data.bin"`]);

		//   String.raw`C:\Users\anhad\.espressif\python_env\idf5.0_py3.8_env\Scripts\python.exe C:\Users\anhad\esp\esp-idf\components\partition_table\parttool.py`,
		//   [` --port`, `COM4`, `--baud`, `115200`, `write_partition`, `--partition-name=nvs`, `--input`, `"data.bin"`]);



		router.push("/");
	}


	return (
		<div className="flex flex-col items-center bg-[#292828] h-full w-screen pt-24">
			<code className='bg-[#8F95A0] p-3 w-screen'><strong>UID: </strong>{ports}</code>
			<ul className="text-sm text-black bg-[#51555D]" aria-labelledby="dropdownDefaultButton">
				{
					(ports.length == 0) ?
						<li>
							<a className="select-none block w-screen px-4 py-2 text-white bg-[#80809D]">No ports</a>
						</li>
						:
						ports.map((p, i) => {
							return (
								<li key={i}>
									<a className="select-none block w-screen px-4 py-2 text-white hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => {
										setSelectedPort(p);
									}}>{p}</a>
								</li>
							)
						})
				}
			</ul>
			<code className='bg-[#8F95A0] w-screen p-3'><strong>PORT: </strong>{selectedPort}</code>
			<CommandTerminal className="p-6" commandObj={getDataCommand} />
			<button
				onClick={savePort}
				className="flex text-sm p-3 font-medium text-center items-center justify-center w-screen text-white bg-green-700 py-3">
				Save</button>
		</div>
	)
}
