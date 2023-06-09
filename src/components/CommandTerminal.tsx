import React from 'react'
import type { Terminal, ITerminalAddon } from 'xterm'

import type { Command } from '@tauri-apps/api/shell';

export interface IProps {
    commandObj: React.MutableRefObject<Command | null>;
    className?: string;
    enabled: boolean;
    commandIdent?: string;
    onLoaded?: () => Promise<void>;
}
export interface IState {
    // missedInitialStart: boolean,
    // terminalReady: boolean
}

class CtrlCXtermAddon implements ITerminalAddon {

    activate(terminal: Terminal): void {
        terminal.attachCustomKeyEventHandler((arg) => {
            if (arg.ctrlKey && arg.code === "KeyC" && arg.type === "keydown") {
                const selection = terminal.getSelection();
                if (selection) {
                    navigator.clipboard.writeText(selection);
                    terminal.select(0, 0, 0);
                    // copyText(selection);
                    return false;
                }
            }
            return true;
        });
    }
    dispose(): void {

        console.log("Disposing CtrlC terminal addon");

        // throw new Error('Method not implemented.');
    }
}

class KongrooBasicsTerminalAddon implements ITerminalAddon {
    activate(terminal: Terminal): void {
        throw new Error('Method not implemented.');
    }
    dispose(): void {
        throw new Error('Method not implemented.');
    }

}

// https://github.com/robert-harbison/xterm-for-react/issues/7
class CommandTerminal extends React.Component<IProps, IState> {
    // Since this is public, it can be referenced further by parent classes so ForwardRef isnt needed
    termRef: React.RefObject<HTMLDivElement>;
    terminal!: Terminal;
    // stdOutListner: 
    constructor(props: IProps) {
        super(props)

        this.termRef = React.createRef();

    }

    async componentDidMount() {
        // this may err, if it occurs in prod need to resolve the promise by try catching and handle retry import if failed 
        const Terminal = (await import('xterm')).Terminal;
        const FitAddon = (await import('xterm-addon-fit')).FitAddon;
        // - xterm-addon-search 0.11.0
        // - xterm-addon-search-bar 0.2.0
        // Very interesting rabbit hole about tree shaking and dynamic imports https://stackoverflow.com/questions/66014730/next-js-bundle-size-is-exploding-as-a-result-of-dynamic-component-lookup-how-to
        // const WebLinksAddon = (await import('xterm-addon-web-links')).WebLinksAddon;

        // https://github.com/xtermjs/xterm.js/issues/2478
        // Maybe xterm isnt the best for this 

        this.terminal = new Terminal({ rows: 19 });
        const fit = new FitAddon();
        // const links = new WebLinksAddon();
        const ctrlc = new CtrlCXtermAddon();
        this.terminal.loadAddon(fit);
        // this.terminal.loadAddon(links);
        this.terminal.loadAddon(ctrlc);
        // Whenever this resizes, call fit
        fit.fit();
        if (this.termRef.current) {
            this.terminal.open(this.termRef.current);
        }
        else {
            console.log("Element of terminal not rendered yet");
        }
        if (this.props.onLoaded) {
            console.log("Running onLoaded function");
            // Currently this doesnt fix the belated loading command issue 
            // TODO: investigate
            await this.props.onLoaded();
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (!prevProps.enabled && this.props.enabled) {

            // THis is because the component didmount is async and can possibly not finish by the time the parent says to run command
            // if (!this.terminal) {
            //     this.setState({ missedInitialStart: true });
            //     debugger;
            //     return;
            // }
            this.startTerminalCommand();
        }

        if (prevProps.enabled && !this.props.enabled) {
            this.stopTerminalCommand();
        }

    }

    startTerminalCommand() {
        this.terminal.clear();

        this.terminal.writeln("Starting Command..." + this.props.commandIdent)
        this.terminal.writeln("Check out https://keydot.kongroo.xyz for FAQ and to raise issues");
        this.props.commandObj.current?.stdout.on('data', (data) => {
            console.log("Got command data", data)
            this.terminal.writeln(data)
        });

        this.props.commandObj.current?.stderr.on('data', (data) => {
            console.log("Got command error", data)
            // https://stackoverflow.com/questions/58044660/how-to-format-text-color-in-xterm-js
            this.terminal.writeln(`\x1b[1;31m${data}\x1b[37m`)
        });

    }
    stopTerminalCommand() {

        this.props.commandObj.current?.stdout.removeAllListeners();
        this.props.commandObj.current?.stderr.removeAllListeners();
    }

    componentWillUnmount(): void {
        this.stopTerminalCommand();
        this.terminal?.dispose();
    }

    render() {
        return (
            // TODO: Only apply classname and relevant props or extract out commandObj
            // 
            <div
                ref={this.termRef}
                className={`${this.props.className} !rounded-lg !bg-black !m-3 !max-h-96`}>
            </div>
        )
    }
}

export default CommandTerminal