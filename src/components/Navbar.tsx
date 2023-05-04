import { useError } from "@/hooks/useError"
import { useEffect } from "react";

const importCards = async () => {

}

const exportCards = async () => {

}

export function Navbar() {
	const setError = useError();
	useEffect(() => {
		setError("CUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUMCUM");
	},[])
	return (
		<ul className="flex bg-[#213352] py-3 z-10 items-center">
			<li className="text-center flex-1">
				<button
					onClick={importCards}
					className="text-gray transition duration-300 hover:scale-105 text-center p-3 bg-[#292828] rounded-lg text-[white]">
					Import
				</button>
			</li>
			<li className="flex-1 mr-2">
				<div className="flex-1 flex justify-center mr-auto ml-auto navbar-center">
					<img className='object-contain select-none' src="/wlogo.svg" />
				</div>
			</li>
			{/* <li className="text-center flex-1">
				<button
					onClick={exportCards}
					className="text-gray transition duration-300 hover:scale-105 text-center p-3 bg-[#292828] rounded-lg text-[white]">
					Export
				</button>
			</li> */}
		</ul>
	)
}
