export interface ToastProps {
	toastText: string,
	activateToast: boolean,
}

export function Toast(props: ToastProps) {
	const toastText = props.toastText;
	const activateToast = props.activateToast;

	return (
		<div id="toast-default" className={`flex select-none animate-bounce transition-opacity duration-300 fixed bottom-0 right-0 items-center p-4 m-6 text-gray-500 bg-[#8B89AC] rounded-lg ${activateToast ? 'opacity-100' : 'opacity-0'}`} role="alert">
			<div className="alert text-white">
				<div>
					<span>{toastText}</span>
				</div>
			</div>
		</div>

	)
}
