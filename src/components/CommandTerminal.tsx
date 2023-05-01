import React from 'react'
import type { Terminal } from 'xterm'

import type { Command } from '@tauri-apps/api/shell';

import 'xterm/css/xterm.css'

export interface IProps {
    commandObj: React.MutableRefObject<Command | null>;
    className?: string;
    enabled: boolean;
    commandIdent?: string;
}
export interface IState {

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

        this.state = {
            input: "",
        }
    }

    async componentDidMount() {
        const Terminal = (await import('xterm')).Terminal;
        this.terminal = new Terminal();
        if (this.termRef.current) {
            this.terminal.open(this.termRef.current);
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (!prevProps.enabled && this.props.enabled) {
            this.terminal.writeln("Starting Command..." + this.props.commandIdent)
            this.props.commandObj.current?.stdout.on('data', (data) => {
                console.log("Got command data", data)
                this.terminal.write(data)
            });

            this.props.commandObj.current?.stderr.on('data', (data) => {
                console.log("Got command error", data)
                this.terminal.write(data)
            });
        }
    }

    componentWillUnmount(): void {
        this.props.commandObj.current?.stdout.removeAllListeners();
    }

    render() {
        return (
            // TODO: Only apply classname and relevant props or extract out commandObj
            <div ref={this.termRef} className={this.props.className} ></div>
        )
    }
}

export default CommandTerminal