import { Navbar } from "@/components/Navbar";
import { useContext, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/useToast";
import { Card } from ".";
import { reflashPartition } from "@/lib/services";
import { NewCardsContext } from "./_app";
import CommandTerminal from "@/components/CommandTerminal";
import { Command } from "@tauri-apps/api/shell";
import { useError } from "@/hooks/useError";

const eyeOffIcon = '/eyeOff.svg'
const eyeOnIcon = '/eyeOn.svg'

export default function CreateCard() {
	const setToast = useToast();
	const setError = useError();

	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [newCards, setNewCards] = useContext(NewCardsContext);
	const [isLoading, setIsLoading] = useState(false);

	const loadingBinaryCommand = useRef<Command | null>(null);
	const [isRunningCommand, setRunningCommand] = useState<boolean>(false);

	const [rfid, setRfid] = useState<string>("");
	const router = useRouter();


	const createCard = async (name: string, password: string) => {
		if (rfid == "") {
			setError("No RFID detected yet");
			return;
		}
		if (name == "") {
			setError("Enter name");
			return
		};
		if (password == "") {
			setError("Enter password");
			return
		};

		const newCard: Card = {
			name,
			password,
			rfid,
		}

		let exitEarly = false;
		setNewCards((prev) => {
			const cardName = newCard.name;
			for (const card of prev) {
				if (cardName == card.name) {
					console.log("dupe");
					setError(`Duplicate card name ${cardName}`);
					exitEarly = true;
					return prev;
				}
			}
			const tempCards = [...prev, newCard];
			return tempCards;
		});

		if (exitEarly) return;

		if (!exitEarly) {
			setToast("Card created!");
			router.push("/");
		}
	}

	return (
		<>
			<button
				onClick={() => router.push("/")}
				className="text-gray text-left p-3 bg-[#213352] w-full text-[white]">Back
			</button>

			<div className='flex flex-col h-screen w-screen p-6 items-center justify-center bg-[#5D616C]'>
				<code className='bg-[#8F95A0] cursor-pointer transition duration-300 hover:scale-95 rounded-lg p-3 mb-3'>
					{isLoading &&
						<strong>UID: {!rfid ? "N/A" : rfid}</strong>
					}
					{!isLoading &&
						<>
							<strong>UID: </strong>
							<input
								type="text"
								placeholder="enter UID..."
								className="input bg-inherit focus:outline-none text-white placeholder-white px-3 rounded-lg"
								onChange={e => { setRfid(e.target.value) }}
								value={rfid}
							/>
						</>
					}
				</code>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						createCard(name, password)
					}}
					className="flex flex-col items-center"
				>
					<div className='flex flex-row items-center'>
						<input
							type="text"
							disabled={isLoading}
							placeholder="enter name..."
							className="input bg-white text-dim-gray py-3 pl-3 pr-[3.75rem] m-3 rounded-lg"
							onChange={e => { setName(e.target.value) }}
						/>
					</div>
					<div className='flex flex-row items-center'>
						<input
							type={`${showPassword ? 'text' : 'password'}`}
							disabled={isLoading}
							placeholder="enter password..."
							className="input bg-white text-dim-gray p-3 mb-3 rounded-l-lg"
							onChange={e => { setPassword(e.target.value) }}
						/>
						<button
							onClick={() => { setShowPassword(!showPassword); }}
							disabled={isLoading}
							className="inline-flex text-sm font-medium text-center items-center px-3 py-3 mb-3 text-white bg-white rounded-r-lg">
							{showPassword ?
								<img className='object-contain w-6 h-6 items-center' src={eyeOnIcon} />
								:
								<img className='object-contain w-6 h-6 items-center' src={eyeOffIcon} />
							}
						</button>
					</div>
				</form>
				<div className="flex flex-row">
					<label htmlFor="create-card-modal" className="btn btn-ghost">
						<button
							onClick={() => {
								createCard(name, password);
							}}
							className="text-gray text-center p-3 m-3 bg-green-700 hover:bg-green-800 rounded-lg text-[white]">Create Card
						</button>
					</label>
					<label htmlFor="create-card-modal" className="btn btn-ghost">
						<button
							onClick={async () => {
								// LOAD CARD READER BINARY HERE
								setIsLoading(true); // disabling all input
								const Command = (await import('@tauri-apps/api/shell')).Command;

								loadingBinaryCommand.current = Command.sidecar("bin/dist/esptool", [
									`--chip`,
									`esp32`,
									`--port`,
									`COM4`,
									`--baud`,
									`921600`,
									`--before`,
									`default_reset`,
									`--after`,
									`hard_reset`,
									`write_flash`,
									`-z`,
									`--flash_mode`,
									`dio`,
									`--flash_freq`,
									`80m`,
									`--flash_size`,
									`detect`,
									`0xe000`,


								])
								// 		C:\Users\anhad\AppData\Local\Arduino15\packages\esp32\hardware\esp32\1.0.6/tools/partitions/boot_app0.bin 0x1000 C:\Users\anhad\AppData\Local\Arduino15\packages\esp32\hardware\esp32\1.0.6/tools/sdk/bin/bootloader_qio_80m.bin 0x10000 C:\Users\anhad\AppData\Local\Temp\arduino_build_509800/read_rfid.ino.bin 0x8000 C:\Users\anhad\AppData\Local\Temp\arduino_build_509800/read_rfid.ino.partitions.bin

								// --chip esp32--port COM4--baud 921600 --before default_reset--after hard_reset write_flash - z--flash_mode dio--flash_freq 80m--flash_size detect 0xe000 C: \Users\anhad\AppData\Local\Arduino15\packages\esp32\hardware\esp32\1.0.6/tools/partitions/boot_app0.bin 0x1000 C:\Users\anhad\AppData\Local\Arduino15\packages\esp32\hardware\esp32\1.0.6/tools/sdk/bin/bootloader_qio_80m.bin 0x10000 C:\Users\anhad\AppData\Local\Temp\arduino_build_509800/read_rfid.ino.bin 0x8000 C:\Users\anhad\AppData\Local\Temp\arduino_build_509800/read_rfid.ino.partitions.bin


							}}
							className="text-gray text-center p-3 m-3 transition duration-300 hover:scale-105 bg-[#292828] rounded-lg text-[white]">Load Card Reader Binary
						</button>
					</label>
				</div>
				{isLoading &&
					<CommandTerminal className="p-6 flex w-auto text-left" commandObj={loadingBinaryCommand} enabled={isLoading} />
				}
			</div >
		</>
	)
}
