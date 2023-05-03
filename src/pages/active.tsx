import { useRouter } from 'next/navigation';

export default function ActiveView() {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center bg-[#292828] h-screen w-screen justify-center">
			<div className="pt-24 justify-center text-4xl pb-6 animate-pulse items-center rounded-lg text-green-700">
				<strong>key.board is active!</strong>
			</div>
			<button
				className="text-gray text-center p-3 m-3 bg-[#5D616C] transition duration-300 hover:scale-105 rounded-lg text-white"
				onClick={() => router.push('/')}>
				Edit Mode
			</button>
		</div>
	)
}