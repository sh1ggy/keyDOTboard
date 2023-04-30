import { invoke } from "@tauri-apps/api";
import { useContext, useEffect, useState } from "react";
import { getPorts } from "../services";
import { PortContext } from "./_app";
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import React from "react";
import Terminal from "@/components/Terminal";


export default function PortSelection() {
	const [ports, setPorts] = useState<string[]>([]);
	const [portOption, setPortOption] = useState("");
	const [selectedPort, setSelectedPort] = useContext(PortContext);
	const setToast = useToast();
	const router = useRouter();

	useEffect(() => {
		getPortsValue();
	}, [])
	const savePort = async () => {
		const listenServer = await invoke('start_listen_server', { "port": portOption });

		if (portOption != "") {
			setSelectedPort(portOption);
			setToast("Saved port!");
			router.push("/");
		}
		else {
			setToast("Select port.");
		}
	}
	const getPortsValue = async () => {
		const getPortsValue = await getPorts();
		setPorts(getPortsValue);
		setSelectedPort(ports[0])
		setToast("Got ports!");
	}

	return (
		<div className="flex flex-col items-center bg-[#80809D] h-full w-screen pt-24">
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
										setPortOption(p);
									}}>{p}</a>
								</li>
							)
						})
				}
			</ul>
			<code className='bg-[#8F95A0] w-screen p-3'><strong>PORT: </strong>{portOption}</code>
			<Terminal />
			<button
				onClick={savePort}
				className="flex text-sm p-3 font-medium text-center items-center justify-center w-screen text-white bg-black py-3">
				Save</button>
		</div>
	)
}
