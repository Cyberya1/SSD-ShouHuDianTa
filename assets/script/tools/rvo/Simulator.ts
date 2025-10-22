import Agent from "./Agent";
import KdTree from "./KdTree";
import Obstacle from "./Obstacle";
import RVOMath from "./RVOMath";
import Vector2 from "./Vector2";

/**
 * @author : Dony
 * @date : 2024-01-08 15:24:43
 * @description : 代码逻辑解析
模拟步骤：doStep()是Simulator类的核心方法，它负责在每个时间步长内更新所有智能体的状态。这包括使用KD树来高效计算邻居，
然后对每个智能体计算新的速度（避免碰撞），并根据新速度更新其位置。
智能体和障碍物管理：Simulator维护了所有智能体和障碍物的列表，并提供了添加和删除它们的方法。每当添加或删除智能体时，都需要更新维护的索引映射。
参数设置：提供了方法来设置智能体的默认参数（如最大速度、邻居距离等）和模拟的全局参数（如时间步长）
*/

export default class Simulator {
    // private static _instance: Simulator;
    // public static get Instance() {
    //     if (!Simulator._instance) {
    //         Simulator._instance = new Simulator();
    //     }
    //     return Simulator._instance;
    // }

    public s_totalID = 0;

    public agentNo2indexDict_: Map<number, number>;
    public index2agentNoDict_: Map<number, number>;

    public agents_: Array<Agent> = [];
    public obstacles_: Array<Obstacle> = [];
    public kdTree_: KdTree;
    public timeStep_: number;

    private defaultAgent_: Agent;
    private globalTime_: number;

    private agentMap = {}

    constructor(totalID?: number) {
        if (typeof totalID === "number") this.s_totalID = totalID;
        this.init();
    }

    private init() {
        this.agents_ = [];
        this.agentNo2indexDict_ = new Map();
        this.index2agentNoDict_ = new Map();
        this.defaultAgent_ = null;
        this.kdTree_ = new KdTree();
        this.kdTree_.simulator = this;
        this.obstacles_ = [];
        this.globalTime_ = 0;
        this.timeStep_ = 0.1;

    }

    public doStep() {
        this.updateDeleteAgent();

        this.kdTree_.buildAgentTree();

        for (let i = 0, j = this.agents_.length; i < j; i++) {
            let agent = this.agents_[i];
            agent.computeNeighbors();
            agent.computeNewVelocity();
        }

        for (let i = 0, j = this.agents_.length; i < j; i++) {
            let agent = this.agents_[i];
            agent.update();
        }

        this.globalTime_ += this.timeStep_;
        return this.globalTime_;
    }

    private updateDeleteAgent() {
        let isDelete = false;
        for (let i = this.agents_.length - 1; i >= 0; i--) {
            if (this.agents_[i].needDelete_) {
                this.agents_.splice(i, 1);
                isDelete = true;
            }
        }
        if (isDelete)
            this.onDelAgent();
    }

    /**
     * 详见RVOConfig.ts
     * @param position 
     * @param neighborDist_ 
     * @param radius_ 
     * @param maxNeighbors_ 
     * @param timeHorizon_ 
     * @param timeHorizonObst_ 
     * @returns 
     */
    public addAgent(position: Vector2, data: any, type: number = 0) {
        if (this.defaultAgent_ == null) return -1;
        let agent = new Agent();
        agent.id_ = this.s_totalID;
        this.s_totalID++;
        const maxNeighbors_ = data?.maxNeighbors || 0
        const neighborDist_ = data?.neighborDist || 0
        const radius_ = data?.radius || 0
        const timeHorizon_ = data?.timeHorizon || 0
        const timeHorizonObst_ = data?.timeHorizonObst || 0
        const avoidenceWeight_ = data?.avoidenceWeight || 0
        agent.maxNeighbors_ = maxNeighbors_ ? maxNeighbors_ : this.defaultAgent_.maxNeighbors_;

        agent.maxSpeed_ = this.defaultAgent_.maxSpeed_;
        agent.neighborDist_ = neighborDist_ ? neighborDist_ : this.defaultAgent_.neighborDist_;
        agent.position_ = position;
        agent.radius_ = radius_ ? radius_ : this.defaultAgent_.radius_;
        agent.timeHorizon_ = timeHorizon_ ? timeHorizon_ : this.defaultAgent_.timeHorizon_;
        agent.timeHorizonObst_ = timeHorizonObst_ ? timeHorizonObst_ : this.defaultAgent_.timeHorizonObst_;
        agent.velocity_ = this.defaultAgent_.velocity_;
        agent.avoidenceWeight_ = avoidenceWeight_ ? avoidenceWeight_ : this.defaultAgent_.avoidenceWeight_;
        agent.simulator = this;
        agent.type = type;
        this.agents_.push(agent);
        this.onAddAgent();
        this.agentMap[agent.id_] = agent;
        return agent.id_;
    }

    public updateAgent(sid: number, data: any) {
        const agent = this.agentMap[sid];
        if (agent == null) {
            console.error("updateAgent error, sid not found:", sid);
            return;
        }
        agent.maxNeighbors_ = data?.maxNeighbors || agent.maxNeighbors_;
        agent.neighborDist_ = data?.neighborDist || agent.neighborDist_;
        agent.radius_ = data?.radius || agent.radius_;
        agent.timeHorizon_ = data?.timeHorizon || agent.timeHorizon_;
        agent.timeHorizonObst_ = data?.maxNeighbors || agent.timeHorizonObst_;
    }

    public addObstacle(vertices: Array<Vector2>) {
        if (vertices.length < 2) return -1;

        let obstacleNo = this.obstacles_.length;
        for (let i = 0; i < vertices.length; ++i) {
            let obstacle = new Obstacle();
            obstacle.point_ = vertices[i];

            if (i != 0) {
                obstacle.previous_ = this.obstacles_[this.obstacles_.length - 1];
                obstacle.previous_.next_ = obstacle;
            }

            if (i == vertices.length - 1) {
                obstacle.next_ = this.obstacles_[obstacleNo];
                obstacle.next_.previous_ = obstacle;
            }

            obstacle.direction_ = RVOMath.normalize(Vector2.subtract(vertices[(i == vertices.length - 1 ? 0 : i + 1)], vertices[i]));

            if (vertices.length == 2) {
                obstacle.convex_ = true;
            } else {
                obstacle.convex_ = (RVOMath.leftOf(vertices[(i == 0 ? vertices.length - 1 : i - 1)], vertices[i], vertices[(i == vertices.length - 1 ? 0 : i + 1)]) >= 0);
            }

            obstacle.id_ = this.obstacles_.length;
            this.obstacles_.push(obstacle);
        }

        return obstacleNo;
    }

    //通过sid  删除代理
    delAgentBySid(sid) {

        // console.log("待删除sid：" + sid);
        let agent = this.agentMap[sid];
        if (agent) {
            agent.needDelete_ = true;
            // this.agentMap[sid] = null;
            delete this.agentMap[sid];
        }
    }

    private onDelAgent() {
        this.agentNo2indexDict_.clear();
        this.index2agentNoDict_.clear();

        for (let i = 0; i < this.agents_.length; i++) {
            let agentNo = this.agents_[i].id_;
            this.agentNo2indexDict_.set(agentNo, i);
            this.index2agentNoDict_.set(i, agentNo);
        }
    }

    private onAddAgent() {
        if (this.agents_.length == 0)
            return;

        let index = this.agents_.length - 1;
        let agentNo = this.agents_[index].id_;
        this.agentNo2indexDict_.set(agentNo, index);
        this.index2agentNoDict_.set(index, agentNo);
    }

    public getAgentPosition(agentNo: number) {
        let agent = this.agents_[this.agentNo2indexDict_.get(agentNo)];
        if (agent) {
            return agent.position_;
        } else {
            return new Vector2(0, 0);
        }
    }

    public setAgentPosition(agentNo: number, position: Vector2) {
        let agent = this.agents_[this.agentNo2indexDict_.get(agentNo)];
        if (agent) {
            agent.position_ = position;
        }
    }

    public getAgentPrefVelocity(agentNo: number) {
        return this.agents_[this.agentNo2indexDict_.get(agentNo)].prefVelocity_;
    }

    /**获取智能体的邻居数量 */
    public getAgentNeighbors(agentNo: number) {
        return this.agents_[this.agentNo2indexDict_.get(agentNo)].agentNeighbors_.length;
    }

    public getAgent(id: number): Agent | null {
        return this.agents_.find(agent => agent.id_ === id) || null;
    }

    public setTimeStep(timeStep: number) {
        this.timeStep_ = timeStep;
    }

    public setAgentDefaults(neighborDist: number, maxNeighbors: number, timeHorizon: number, timeHorizonObst: number, radius: number, maxSpeed: number, velocity: Vector2) {
        if (this.defaultAgent_ == null) {
            this.defaultAgent_ = new Agent();
        }

        this.defaultAgent_.maxNeighbors_ = maxNeighbors;
        this.defaultAgent_.maxSpeed_ = maxSpeed;
        this.defaultAgent_.neighborDist_ = neighborDist;
        this.defaultAgent_.radius_ = radius;
        this.defaultAgent_.timeHorizon_ = timeHorizon;
        this.defaultAgent_.timeHorizonObst_ = timeHorizonObst;
        this.defaultAgent_.velocity_ = velocity;
    }

    public processObstacles() {
        this.kdTree_.buildObstacleTree();
    }

    public setAgentPrefVelocity(agentNo: number, prefVelocity: Vector2) {
        let agent = this.agents_[this.agentNo2indexDict_.get(agentNo)];
        if (agent) agent.prefVelocity_ = prefVelocity;
        // this.agents_[this.agentNo2indexDict_.get(agentNo)].prefVelocity_ = prefVelocity;
    }
    // public setAgentPrefVelocity(agentNo: number, prefVelocity: Vector2) {
    //     this.agents_[this.agentNo2indexDict_.get(agentNo)].prefVelocity_ = prefVelocity;
    // }
}
