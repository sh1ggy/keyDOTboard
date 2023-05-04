import { Navbar } from "@/components/Navbar";
import { useContext, useState } from "react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/useToast";
import { Card } from ".";
import { reflashPartition } from "@/lib/services";
import { LoadedCardsContext, NewCardsContext } from "./_app";

const eyeOffIcon = '/eyeOff.svg'
const eyeOnIcon = '/eyeOn.svg'

export default function CreateCard() {
	const setToast = useToast();
	const createCard = async (name: string, password: string) => {
		if (rfid == null) {
			setToast("No RFID detected yet");
			return;
		}
		if (name == "") {
			setToast("Enter name");
			return
		};
		if (password == "") {
			setToast("Enter password");
			return
		};

		const newCard: Card = {
			name: name,
			password: password,
			rfid: "rfid",
		}
		let exitEarly = false;
		setNewCards((prev) => {
			const cardName = newCard.name;
			for (const card of prev) {
				if (cardName == card.name) {
					console.log("dupe");
					setToast(`Duplicate card name ${cardName}`);
					exitEarly = true;
					return prev;
				}
			}
			const tempCards = [...prev, newCard];
			return tempCards;
		});
		if (exitEarly) return;
		if (await reflashPartition() && !exitEarly) {
			setToast("Card created!");
			router.push("/");
		}
	}

	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	// const [cards, setCards] = useContext(CardsContext);
	const [newCards, setNewCards] = useContext(NewCardsContext);

	// TODO: rfid detection function move here
	const rfid = "";
	const router = useRouter();
	return (
		<>
			<button
				onClick={() => router.push("/")}
				className="text-gray text-left p-3 bg-[#213352] w-full text-[white]">Back
			</button>

			<div className='flex flex-col h-screen w-screen p-6 items-center justify-center bg-[#5D616C]'>
				<code className='bg-[#8F95A0] rounded-lg p-3 mb-3'><strong>UID: {!rfid ? "N/A" : rfid}</strong></code>
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
							placeholder="enter name..."
							className="input bg-white text-dim-gray py-3 pl-3 pr-[3.75rem] m-3 rounded-lg"
							onChange={e => { setName(e.target.value) }}
						/>
					</div>
					<div className='flex flex-row items-center'>
						<input
							type={`${showPassword ? 'text' : 'password'}`}
							placeholder="enter password..."
							className="input bg-white text-dim-gray p-3 mb-3 rounded-l-lg"
							onChange={e => { setPassword(e.target.value) }}
						/>
						<button
							onClick={() => { setShowPassword(!showPassword); }}
							className="inline-flex text-sm font-medium text-center items-center px-3 py-3 mb-3 text-white bg-white rounded-r-lg">
							{showPassword ?
								<img className='object-contain w-6 h-6 items-center' src={eyeOnIcon} />
								:
								<img className='object-contain w-6 h-6 items-center' src={eyeOffIcon} />
							}
						</button>
					</div>
				</form>
				<label htmlFor="create-card-modal" className="btn btn-ghost">
					<button
						onClick={() => {
							createCard(name, password);
						}}
						className="text-gray text-center p-3 m-3 bg-[#292828] rounded-lg text-[white]">Create Card
					</button>
				</label>
			</div>
		</>
	)
}
