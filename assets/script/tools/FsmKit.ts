// 本代码参考unity C#实现，用法详情看注释
//public class IStateBasicUsageExample : MonoBehaviour
//     {
//         public enum States
//         {
//             A,
//             B
//         }

//         public FSM<States> FSM = new FSM<States>();

//         void Start()
//         {
//             FSM.OnStateChanged((previousState, nextState) =>
//             {
//                 Debug.Log($""{previousState}=>{nextState}"");
//             });

//             FSM.State(States.A)
//                 .OnCondition(()=>FSM.CurrentStateId == States.B)
//                 .OnEnter(() =>
//                 {
//                     Debug.Log(""Enter A"");
//                 })
//                 .OnUpdate(() =>
//                 {
                    
//                 })
//                 .OnFixedUpdate(() =>
//                 {
                    
//                 })
//                 .OnGUI(() =>
//                 {
//                     GUILayout.Label(""State A"");
//                     if (GUILayout.Button(""To State B""))
//                     {
//                         FSM.ChangeState(States.B);
//                     }
//                 })
//                 .OnExit(() =>
//                 {
//                     Debug.Log(""Exit A"");
//                 });

//                 FSM.State(States.B)
//                     .OnCondition(() => FSM.CurrentStateId == States.A)
//                     .OnGUI(() =>
//                     {
//                         GUILayout.Label(""State B"");
//                         if (GUILayout.Button(""To State A""))
//                         {
//                             FSM.ChangeState(States.A);
//                         }
//                     });
            
//                 FSM.StartState(States.A);
//             }

//             private void Update()
//             {
//                 FSM.Update();
//             }

//             private void FixedUpdate()
//             {
//                 FSM.FixedUpdate();
//             }

//             private void OnGUI()
//             {
//                 FSM.OnGUI();
//             }

//             private void OnDestroy()
//             {
//                 FSM.Clear();
//             }
//         }
//     }

// public class IStateClassExample : MonoBehaviour
//     {

//         public enum States
//         {
//             A,
//             B,
//             C
//         }

//         public FSM<States> FSM = new FSM<States>();

//         public class StateA : AbstractState<States,IStateClassExample>
//         {
//             public StateA(FSM<States> fsm, IStateClassExample target) : base(fsm, target)
//             {
//             }

//             protected override bool OnCondition()
//             {
//                 return mFSM.CurrentStateId == States.B;
//             }

//             public override void OnGUI()
//             {
//               }

//             protected override bool OnCondition()
//             {
//                 return mFSM.CurrentStateId == States.A;
//             }

//             public override void OnGUI()
//             {
//                 GUILayout.Label(""State B"");

//                 if (GUILayout.Button(""To State A""))
//                 {
//                     mFSM.ChangeState(States.A);
//                 }
//             }
//         }

//         private void Start()
//         {
//             FSM.AddState(States.A, new StateA(FSM, this));
//             FSM.AddState(States.B, new StateB(FSM, this));

//             // 支持和链式模式混用
//             // FSM.State(States.C)
//             //     .OnEnter(() =>
//             //     {
//             //
//             //     });
            
//             FSM.StartState(States.A);
//         }

//         private void OnGUI()
//         {
//             FSM.OnGUI();
//         }

//         private void OnDestroy()
//         {
//             FSM.Clear();
//         }
//     }
// }       GUILayout.Label(""State A"");

//                 if (GUILayout.Button(""To State B""))
//                 {
//                     mFSM.ChangeState(States.B);
//                 }
//             }
//         }
        
        
//         public class StateB: AbstractState<States,IStateClassExample>
//         {
//             public StateB(FSM<States> fsm, IStateClassExample target) : base(fsm, target)
//             {
       

// 适配 Cocos Creator 的有限状态机
export interface IState {
    Condition(): boolean;
    Enter(): void;
    Update(dt: number): void;
    FixedUpdate(dt: number): void;
    LateUpdate(dt: number): void;
    Exit(): void;
}

export class CustomState implements IState {

    private mOnCondition?: () => boolean;
    private mOnEnter?: () => void;
    private mOnUpdate?: (dt: number) => void;
    private mOnFixedUpdate?: (dt: number) => void;
    private mOnLateUpdate?: (dt: number) => void;
    private mOnExit?: () => void;

    OnCondition(onCondition: () => boolean): this {
        this.mOnCondition = onCondition;
        return this;
    }

    OnEnter(onEnter: () => void): this {
        this.mOnEnter = onEnter;
        return this;
    }

    OnUpdate(onUpdate: (dt: number) => void): this {
        this.mOnUpdate = onUpdate;
        return this;
    }

    OnFixedUpdate(onFixedUpdate: (dt: number) => void): this {
        this.mOnFixedUpdate = onFixedUpdate;
        return this;
    }

    OnLateUpdate(onLateUpdate: (dt: number) => void): this {
        this.mOnLateUpdate = onLateUpdate;
        return this;
    }

    OnExit(onExit: () => void): this {
        this.mOnExit = onExit;
        return this;
    }

    Condition(): boolean {
        const result = this.mOnCondition?.();
        return result === undefined || result;
    }

    Enter(): void {
        this.mOnEnter?.();
    }

    Update(dt: number): void {
        this.mOnUpdate?.(dt);
    }

    FixedUpdate(dt: number): void {
        this.mOnFixedUpdate?.(dt);
    }

    LateUpdate(dt: number): void {
        this.mOnLateUpdate?.(dt);
    }


    Exit(): void {
        this.mOnExit?.();
    }
}

export class FSM<T> {
    protected mStates: Map<T, IState> = new Map();

    AddState(id: T, state: IState): void {
        this.mStates.set(id, state);
    }

    State(t: T): CustomState {
        if (this.mStates.has(t)) {
            return this.mStates.get(t) as CustomState;
        }
        const state = new CustomState();
        this.mStates.set(t, state);
        return state;
    }

    private mCurrentState?: IState;
    private mCurrentStateId?: T;
    public get CurrentState(): IState | undefined { return this.mCurrentState; }
    public get CurrentStateId(): T | undefined { return this.mCurrentStateId; }
    public PreviousStateId?: T;

    public FrameCountOfCurrentState: number = 1;
    public SecondsOfCurrentState: number = 0.0;

    private mOnStateChanged: Array<(prev: T | undefined, next: T | undefined) => void> = [];

    ChangeState(t: T): void {
        if (t === this.mCurrentStateId) return;
        const state = this.mStates.get(t);
        if (state) {
            if (this.mCurrentState && state.Condition()) {
                this.mCurrentState.Exit();
                this.PreviousStateId = this.mCurrentStateId;
                this.mCurrentState = state;
                this.mCurrentStateId = t;
                this.mOnStateChanged.forEach(cb => cb(this.PreviousStateId, this.mCurrentStateId));
                this.FrameCountOfCurrentState = 1;
                this.SecondsOfCurrentState = 0.0;
                this.mCurrentState.Enter();
            }
        }
    }

    OnStateChanged(cb: (prev: T | undefined, next: T | undefined) => void): void {
        this.mOnStateChanged.push(cb);
    }

    StartState(t: T): void {
        const state = this.mStates.get(t);
        if (state) {
            this.PreviousStateId = t;
            this.mCurrentState = state;
            this.mCurrentStateId = t;
            this.FrameCountOfCurrentState = 0;
            this.SecondsOfCurrentState = 0.0;
            state.Enter();
        }
    }

    FixedUpdate(dt: number): void {
        this.mCurrentState?.FixedUpdate(dt);
    }

    LateUpdate(dt: number): void {
        this.mCurrentState?.LateUpdate(dt);
    }

    Update(dt: number): void {
        // dt 由 Cocos Creator 的 update(dt) 生命周期传入
        this.mCurrentState?.Update(dt);
        this.FrameCountOfCurrentState++;
        this.SecondsOfCurrentState += dt;
    }

    Clear(): void {
        this.mCurrentState = undefined;
        this.mCurrentStateId = undefined;
        this.mStates.clear();
    }
}

export abstract class AbstractState<TStateId, TTarget> implements IState {
    protected mFSM: FSM<TStateId>;
    protected mTarget: TTarget;

    constructor(fsm: FSM<TStateId>, target: TTarget) {
        this.mFSM = fsm;
        this.mTarget = target;
    }


    Condition(): boolean {
        return this.OnCondition();
    }

    Enter(): void {
        this.OnEnter();
    }

    Update(dt: number): void {
        this.OnUpdate(dt);
    }

    FixedUpdate(dt: number): void {
        this.OnFixedUpdate(dt);
    }

    LateUpdate(dt: number): void {
        this.OnLateUpdate(dt);
    }

    Exit(): void {
        this.OnExit();
    }

    protected OnCondition(): boolean { return true; }
    protected OnEnter(): void { }
    protected OnUpdate(dt: number): void { }
    protected OnFixedUpdate(dt: number): void { }
    protected OnLateUpdate(dt: number): void { }
    protected OnExit(): void { }

}