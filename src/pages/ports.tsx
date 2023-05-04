import { useContext, useEffect, useRef, useState } from "react";
import { getCurrentWorkingDir, getEspBinDir, getPorts, getReadBinDir, startImports, startlistenServer, test } from "@/lib/services";
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
	const [isRunningCommand, setRunningCommand] = useState<boolean>(false);

	useEffect(() => {
		const init = async () => {
			await startImports();
			const recvPorts = await getPorts();
			setPorts(recvPorts);
			setSelectedPort(recvPorts[0]);
		}
		init();

		// router.push("/");
	}, [])

	const savePort = async () => {
		setSelectedPort(selectedPort);
		setToast("Selected device at port: " + selectedPort);

		const espBin = await getEspBinDir();
		const readFileBin = await getReadBinDir();

		const Command = (await import('@tauri-apps/api/shell')).Command;
		// Name of the sidecar has to match exactly to the scope name
		getDataCommand.current = Command.sidecar('bin/dist/parttool', [`-e`, `${espBin}`, `--port`, `${selectedPort}`, `--baud`, `115200`, `read_partition`, `--partition-name=nvs`, `--output`, readFileBin]);

		// //   String.raw`C:\Users\anhad\.espressif\python_env\idf5.0_py3.8_env\Scripts\python.exe C:\Users\anhad\esp\esp-idf\components\partition_table\parttool.py`,
		// //   [` --port`, `COM4`, `--baud`, `115200`, `write_partition`, `--partition-name=nvs`, `--input`, `"data.bin"`]);

		const childProcess = await getDataCommand.current.spawn();
		setRunningCommand(true);
		getDataCommand.current.stdout.on("data", (data: string) => {
			// This should be in the stderror state but its not for some reason, 
			// try and get raw stdout pipe from tauri first to detect "Connecting......." first, then try and fix from python side
			const bootModeErrorString = "Wrong boot mode detected (0x13)";
			if (data.includes(bootModeErrorString)) {
				// Ping the user that they need to hold down the boot button and try again
			}
		})

		getDataCommand.current.on('close', () => {
			console.log(`Saved BinaryFile in: ${readFileBin}`);
			setToast(`Saved BinaryFile in: ${readFileBin}`);
			setRunningCommand(false);
			router.push("/");
		})

		//Run Analyze binary

		//Read output json and parse

		//save cards to global state



		// if (selectedPort == null) return;
		// await startlistenServer(selectedPort);


	}


	return (
		<>
			<button
				onClick={async () => {
					const recvPorts = await getPorts();
					setPorts(recvPorts);
				}}
				className="flex px-6 text-sm font-medium text-right justify-end w-screen text-white bg-black py-3">
				Force Detect Ports
			</button>
			<div className="flex flex-col items-center bg-[#292828] h-full w-screen">
				<div className="justify-center text-white w-screen text-xl py-6 px-3 bg-[#213352]"><strong>Port Selection</strong></div>
				<ul className="text-sm text-black bg-[#51555D]" aria-labelledby="dropdownDefaultButton">
					{
						(ports.length == 0) ?
							<li>
								<a className="select-none block w-screen px-3 py-2 text-white bg-[#80809D]">No ports</a>
							</li>
							:
							ports.map((p, i) => {
								return (
									<>
										{(selectedPort == p) ?
											<li key={i} className="cursor-pointer">
												<a className="select-none block w-screen px-3 py-2 bg-gray-500 text-white" onClick={() => {
													setSelectedPort(p);
												}}>{p}</a>
											</li>
											:
											<li key={i} className="cursor-pointer">
												<a className="select-none block w-screen px-3 py-2 text-white hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white active:animate-pulse" onClick={() => {
													setSelectedPort(p);
												}}>{p}</a>
											</li>
										}
									</>
								)
							})
					}
				</ul>
				<code className='bg-[#8F95A0] w-full p-3 px-3 text-sm'><strong>Selected Port: </strong>{selectedPort}</code>
				<button
					onClick={savePort}
					className="flex text-sm p-3 font-medium text-center items-center justify-center w-screen text-white bg-green-700 py-3">
					Connect To Device
				</button>
				<CommandTerminal enabled={isRunningCommand} className="p-6 flex w-auto bg-transparent" commandObj={getDataCommand} />
			</div>
		</>
	)
}
