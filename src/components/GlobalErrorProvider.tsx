
import { ReactNode, FunctionComponent, memo, useEffect, useState, createContext, useCallback } from 'react';
const dismissIcon = '/dismiss.svg'

interface Props {
  children: ReactNode;
}

type ErrorContextValue = (...args: string[]) => void;

export const ErrorContext = createContext<ErrorContextValue>({} as ErrorContextValue);

const ERROR_TOAST_DELAY = 10_000;

const GlobalErrorProvider: FunctionComponent<Props> = ({ children }) => {

  const [error, setError] = useState<string[] | null>(null);
  const [remainingError, setRemainingError] = useState<string[]>(["Sample Error:"]);

  const errorCallBack = useCallback((...args: string[]) => {
    setError(args);
  }, [setError]);

  // Handles error changing and going back to null after some time
  // https://github.com/craig1123/react-recipes/blob/master/src/useDebounce.js for inspiration

  useEffect(() => {
    if (error == null) return;
    setRemainingError(error);
  }, [error]);

  return (

    <ErrorContext.Provider value={errorCallBack}>
      {children}
      {/* toast for persistance through pages  */}
      <div
        id="toast-default"
        role="alert"
        className={`flex w-2/5 break-all transition-opacity duration-300 fixed bottom-0 left-0 items-center p-4 m-6 text-gray-500 bg-[#EB4C63] rounded-lg 
        ${error ? 'opacity-100' : 'opacity-0'}`}>

        <div className="flex flex-col text-sm font-normal text-white">
          {remainingError &&
            <span><strong>ERROR:</strong> {remainingError[0]}</span>
          }
          <>
            {remainingError.length > 1 &&
              <span className='text-xs mt-3'><strong>STACKTRACE:</strong></span>
            }
            {remainingError
              .map((e, i) => ({ e, i }))
              .filter(({ e, i }) => i != 0)
              .map(({ e, i }) => {
                return (
                  <p className="block text-xs text-white dark:hover:text-white">{e}</p>
                )
              })}
          </>
        </div>
        <div className="flex items-center ml-auto space-x-2">
          <button
            onClick={() => setError(null)}
            type="button"
            className="select-none focus:outline-none focus:ring-slate bg-[#EB4C63] text-gray-400 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-[#b94455] inline-flex h-8 w-8" data-dismiss-target="#toast-undo" aria-label="Close">
            <img className='object-contain w-6 h-6' src={dismissIcon} />
          </button>
        </div>
      </div>
    </ErrorContext.Provider >
  );
};

export default memo(GlobalErrorProvider);