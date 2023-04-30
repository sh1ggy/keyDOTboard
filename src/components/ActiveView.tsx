import { useEffect, useState } from "react";

export interface ActiveViewProps {
	activeView: boolean,
	setActiveView: React.Dispatch<React.SetStateAction<boolean>>,
}

export function ActiveView(props: ActiveViewProps) {
	return (
		<div className="flex flex-col items-center bg-[#80809D] h-screen w-screen pt-24">
			<div className="pt-24 justify-center text-2xl animate-bounce items-center rounded-lg text-white">Key.board is active
			</div>
			<button className="text-gray text-center p-3 m-3 bg-[#292828] rounded-lg text-white"
				onClick={() => props.setActiveView(!props.activeView)}>Edit mode</button>
		</div>
	)
}
