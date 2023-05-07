
import { ReactNode, FunctionComponent, memo, useEffect, useState, createContext } from 'react';

interface Props {
  children: ReactNode;
}

type ErrorContextValue = React.Dispatch<React.SetStateAction<string | null>>;

export const ErrorContext = createContext<ErrorContextValue>({} as ErrorContextValue);

const ERROR_TOAST_DELAY = 10_000;

const GlobalErrorProvider: FunctionComponent<Props> = ({ children }) => {

  const [error, setError] = useState<string | null>(null);
  const [remainingError, setRemainingError] = useState("");

  // Handles error changing and going back to null after some time
  // https://github.com/craig1123/react-recipes/blob/master/src/useDebounce.js for inspiration
  useEffect(() => {
    if (error == null) return;
    setRemainingError(error);

    let timer = setTimeout(() => { setError(null) }, ERROR_TOAST_DELAY);

    return () => {
      clearTimeout(timer);
    }
  }, [error]);
  return (

    <ErrorContext.Provider value={setError}>
      {children}
      {/* toast for persistance through pages  */}
      <div id="toast-default" className={`flex w-1/3 break-all transition-opacity duration-300 fixed bottom-0 left-0 items-center p-4 m-6 text-gray-500 bg-[#EB4C63] rounded-lg ${error ? 'opacity-100' : 'opacity-0'}`} role="alert">
        <div className="alert text-white">
          <div>
            <span><strong>ERROR:</strong> {remainingError}</span>
          </div>
        </div>
      </div>
    </ErrorContext.Provider >
  );
};

export default memo(GlobalErrorProvider);