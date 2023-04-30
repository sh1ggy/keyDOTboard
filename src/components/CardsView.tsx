import { Card } from "@/pages";

const deleteIcon = '/delete.svg'
const editIcon = '/edit.svg'

export interface CardsViewProps {
	cards: Card[],
	setEditView: React.Dispatch<React.SetStateAction<boolean>>,
	setIndex: React.Dispatch<React.SetStateAction<number>>,
	deleteCard: (i: number) => Promise<void>,
	card: Card,
	cardsIndex: number,
}

export function CardsView(props: CardsViewProps) {
	const cards = props.cards;
	const setIndex = props.setIndex;
	const setEditView = props.setEditView;
	const deleteCard = props.deleteCard;
	const cardsIndex = props.cardsIndex;
	const card = props.card;

	return (
		<>
			<div className='flex flex-col items-start'>
				<p className="mb-3 text-sm font-bold tracking-tight text-gray-900 dark:text-white">ID: {card.rfid}</p>
				<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{card.name}</h5>
			</div>
			<div className='flex flex-row items-end'>
				<button className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
					<img
						onClick={() => {
							setEditView(true);
							setIndex(cardsIndex);
						}}
						className='object-contain w-6 h-6 items-center' src={editIcon} />
				</button>
				<button onClick={() => deleteCard(cardsIndex)} className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
					<img className='object-contain w-6 h-6 items-center' src={deleteIcon} />
				</button>
			</div>
		</>
	)
}