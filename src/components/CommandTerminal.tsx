import React from 'react'
import type { Terminal } from 'xterm'

import type { Command } from '@tauri-apps/api/shell';

import 'xterm/css/xterm.css'

export interface IProps {
    commandObj: React.MutableRefObject<Command | null>;
    className?: string;
}
export interface IState {

}

// https://github.com/robert-harbison/xterm-for-react/issues/7
class CommandTerminal extends React.Component<IProps, IState> {
    // Since this is public, it can be referenced further by parent classes so ForwardRef isnt needed
    termRef: React.RefObject<HTMLDivElement>;
    terminal!: Terminal;
    constructor(props:IProps) {
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
            this.terminal.open(this.termRef.current)
        }
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        
    }

    render() {
        return (
            // TODO: Only apply classname and relevant props or extract out commandObj
            <div ref={this.termRef} {...this.props}></div>
        )
    }
}

export default CommandTerminal