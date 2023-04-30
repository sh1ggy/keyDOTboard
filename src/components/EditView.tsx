import { Card } from "@/pages";
import { useState } from "react";

const eyeOffIcon = '/eyeOff.svg'
const eyeOnIcon = '/eyeOn.svg'
const dismissIcon = '/dismiss.svg'
const saveIcon = '/save.svg'

export interface EditViewProps {
	cards: Card[],
	index: number,
	saveCard: (i: number) => void,
	setEditName: React.Dispatch<React.SetStateAction<string>>,
	setEditPassword: React.Dispatch<React.SetStateAction<string>>,
	setEditView: React.Dispatch<React.SetStateAction<boolean>>,
}

export function EditView(props: EditViewProps) {
	const [showPassword, setShowPassword] = useState(false);
	
	const setEditName = props.setEditName;
	const setEditPassword = props.setEditPassword;
	const setEditView = props.setEditView;
	const cards = props.cards;
	const index = props.index;
	
	return (
		<div className='flex flex-col mt-24 mx-6'>
			<div className="justify-center text-white text-xl p-6  bg-[#8B89AC] rounded-t-lg" >Editing Card</div>
			<div className="justify-center text-white p-6 bg-[#5D616C] rounded-b-lg ">
				<p className="mb-3 text-sm font-bold tracking-tight text-gray-900 dark:text-white">ID: {cards[index].rfid}</p>
				<input
					type='text'
					placeholder={cards[index].name}
					className="input w-full max-w-xs bg-[#5D616C] text-white text-dim-gray p-3 rounded-lg"
					onChange={e => { setEditName(e.target.value) }}
				/>
				<div className='flex flex-row items-center pb-3'>
					<input
						type={`${showPassword ? 'text' : 'password'}`}
						placeholder="enter password..."
						className="input w-full max-w-xs bg-white text-black text-dim-gray p-3 rounded-l-lg"
						onChange={e => { setEditPassword(e.target.value) }}
					/>
					<button
						onClick={() => {
							setShowPassword(!showPassword);
						}}
						className="inline-flex text-sm font-medium text-center h-full items-center rounded-r-lg text-white bg-white py-3">
						{showPassword ?
							<img className='object-contain w-6 h-6 items-center' src={eyeOnIcon} />
							:
							<img className='object-contain w-6 h-6 items-center' src={eyeOffIcon} />
						}
					</button>
				</div>
				<button onClick={() => setEditView(false)} className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
					<img className='object-contain w-6 h-6 items-center' src={dismissIcon} />
				</button>
				<button onClick={() => props.saveCard(index)} className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
					<img className='object-contain w-6 h-6 items-center' src={saveIcon} />
				</button>
			</div>
		</div>
	)
}