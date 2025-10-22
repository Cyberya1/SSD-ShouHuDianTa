import { _decorator, Component } from 'cc';
import { AbstractState, FSM } from '../tools/FsmKit';
const { ccclass, property } = _decorator;

export enum State {
    IDLE,
    MOVE,
    ATTACK,
    DIE
}

export class StateHandler extends AbstractState<State, Hunter> {
    constructor(fsm: FSM<State>, target: Hunter) {
        super(fsm, target);
    }
}

@ccclass('Hunter')
export class Hunter extends Component {

    private fsm: FSM<State> = null;

    protected onLoad(): void {
        this.fsm = new FSM<State>();
        this.fsm.AddState(State.ATTACK, new StateHandler(this.fsm, this));
        this.fsm.AddState(State.IDLE, new StateHandler(this.fsm, this));
        this.fsm.AddState(State.MOVE, new StateHandler(this.fsm, this));
        this.fsm.AddState(State.DIE, new StateHandler(this.fsm, this));

        this.fsm.StartState(State.IDLE);
    }
}


