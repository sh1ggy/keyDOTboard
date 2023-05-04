import { useToast } from "@/hooks/useToast";
import { Card } from "@/pages";
import { LoadedCardsContext, NewCardsContext } from "@/pages/_app";
import { reflashPartition } from "@/lib/services";
import { useRouter } from "next/router";
import { useContext } from "react";

const deleteIcon = '/delete.svg'
const editIcon = '/edit.svg'

export interface CardsViewProps {
	card: Card,
	cardIndex: number,
}

export function CardsView(props: CardsViewProps) {
	const deleteCard = async (i: number) => {
    setCards((prev) => {
      const tempCards = [...prev];
      tempCards.splice(i, 1);
      return tempCards;
    })

    if (await reflashPartition())
      setToast("Card deleted");
  }
	const [cards, setCards] = useContext(NewCardsContext);
	const setToast = useToast();
	const router = useRouter();

	const cardIndex = props.cardIndex;
	const card = props.card;

	return (
		<div className="flex flex-col max-w-sm p-6 bg-[#5D616C] rounded-lg mt-24 mx-6">
			<div className='flex flex-col items-start overflow-clip'>
				<p className="mb-3 text-sm font-bold tracking-tight text-gray-900 dark:text-white">ID: {card.rfid}</p>
				<h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{card.name}</h5>
			</div>
			<div className='flex flex-row items-end'>
				<button className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
					<img
						onClick={() => {
							router.push(`/edit/${cardIndex}`)
						}}
						className='object-contain w-6 h-6 items-center' src={editIcon} />
				</button>
				<button
					onClick={() => deleteCard(cardIndex)}
					className="inline-flex px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
					<img className='object-contain w-6 h-6 items-center' src={deleteIcon} />
				</button>
			</div>
		</div>
	)
}