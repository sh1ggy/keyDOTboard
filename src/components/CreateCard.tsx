import { useState } from "react";

const eyeOffIcon = '/eyeOff.svg'
const eyeOnIcon = '/eyeOn.svg'

export interface CreateCardProps {
	editView: boolean,
	rfid: string | null,
	setCreateName: React.Dispatch<React.SetStateAction<string>>,
	setCreatePassword: React.Dispatch<React.SetStateAction<string>>,
	createCard: () => Promise<void>,
}

export function CreateCard(props: CreateCardProps) {
  const [showPassword, setShowPassword] = useState(false);
	
	const setCreateName = props.setCreateName;
	const setCreatePassword = props.setCreatePassword;
	
	const editView = props.editView;
	const rfid = props.rfid;
	const createCard = props.createCard;

	return (
		<div className='flex flex-col h-full w-screen p-6 items-center bg-[#5D616C]'>
			<code className='bg-[#8F95A0] rounded-lg p-3 mb-3'><strong>UID: </strong>{rfid}</code>
			<input
				type="text"
				placeholder="enter name..."
				disabled={editView}
				className="input bg-white text-dim-gray py-3 pl-3 pr-16 m-3 rounded-lg"
				onChange={e => { setCreateName(e.target.value) }}
			/>
			<div className='flex flex-row items-center'>
				<input
					type={`${showPassword ? 'text' : 'password'}`}
					placeholder="enter password..."
					disabled={editView}
					className="input w-full max-w-xs bg-white text-dim-gray p-3 mb-3 rounded-l-lg"
					onChange={e => { setCreatePassword(e.target.value) }}
				/>
				<button
					disabled={editView}
					onClick={() => { setShowPassword(!showPassword); }}
					className="inline-flex text-sm font-medium text-center h-full items-center px-3 py-3 mb-3 text-white rounded-r-lg bg-white">
					{showPassword ?
						<img className='object-contain w-6 h-6 items-center' src={eyeOnIcon} />
						:
						<img className='object-contain w-6 h-6 items-center' src={eyeOffIcon} />
					}
				</button>
			</div>
			<label htmlFor="create-card-modal" className="btn btn-ghost">
				<button disabled={editView} className="text-gray text-center p-3 m-3 bg-[#292828] rounded-lg text-[white]" onClick={createCard}>Create Card</button>
			</label>
		</div>
	)
}
