import { Card } from "@/pages";
import { useContext, useEffect, useState } from "react";
import { NewCardsContext } from "@/pages/_app";
import { useToast } from "@/hooks/useToast";
import { usePrevious } from "@/hooks/usePrevious";
import { useRouter } from "next/router";
import { useError } from "@/hooks/useError";

const eyeOffIcon = '/eyeOff.svg'
const eyeOnIcon = '/eyeOn.svg'

export default function EditView() {
	const saveCard = (i: number) => {
		let exitEarly = false;
		setCards((prev) => {
			const editCard: Card = {
				name: name,
				password: password,
				rfid: prev[i].rfid,
			}
			const cardName = editCard.name;
			for (const card of prev) {
				if (cardName == card.name) {
					console.log("dupe");
					setError(`Duplicate card name ${cardName}`);
					exitEarly = true;
					return prev;
				}
			}
			const tempCards = [...prev];
			tempCards.splice(i, 1, editCard);
			setToast("Card saved!");
			return tempCards;
		});
		if (exitEarly) return;
	}

	const setToast = useToast();
	const [cards, setCards] = useContext(NewCardsContext);
	const router = useRouter();

	const index = parseInt(router.query.id as string);
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const setError = useError();

	useEffect(() => {
		setName(cards[index].name);
		setPassword(cards[index].password);

	}, [cards])

	return (
		<>
			<div className='flex flex-col mx-6 items-center h-screen overflow-hidden justify-center'>
			<button
				onClick={() => router.push("/")}
				className="w-full absolute top-0 inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-[#213352]">
				Back
			</button>
				{/* <div className="justify-center text-white text-xl p-6 bg-[#213352] rounded-t-lg">Editing Card</div> */}
				<div className="justify-center text-white p-6 bg-[#5D616C] items-center rounded-lg ">
					<div className="my-6">
						<code className='text-sm font-bold tracking-tight text-gray-900 bg-[#8F95A0] rounded-lg p-3 mb-3'>
							ID: {cards[index]?.rfid}
						</code>
					</div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							saveCard(index);
						}}
						className="flex flex-col items-center"
					>
						<input
							type='text'
							placeholder={cards[index]?.name}
							className="input w-full max-w-xs bg-[#747986] text-white text-dim-gray p-3 mb-3 border-neutral-300 rounded-lg"
							onChange={e => { setName(e.target.value) }}
						/>
						<div className='flex flex-row items-center pb-3'>
							<input
								type={`${showPassword ? 'text' : 'password'}`}
								placeholder="enter password..."
								className="input w-full max-w-xs bg-white text-black text-dim-gray p-3 rounded-l-lg"
								onChange={e => { setPassword(e.target.value) }}
							/>
							<button
								onClick={() => {
									setShowPassword(!showPassword);
								}}
								className="inline-flex text-sm font-medium text-center h-full items-center rounded-r-lg text-white bg-white p-3">
								{showPassword ?
									<img className='object-contain w-6 h-6 items-center' src={eyeOnIcon} />
									:
									<img className='object-contain w-6 h-6 items-center' src={eyeOffIcon} />
								}
							</button>
						</div>
						<label htmlFor="create-card-modal" className="btn btn-ghost">
							<button
								onClick={() => () => saveCard(index)}
								className="text-gray text-center p-3 m-3 bg-green-700 hover:bg-green-800 rounded-lg text-[white]">Save Card
							</button>
						</label>
					</form>
				</div>
			</div>
		</>
	)
}