import { Vec3 } from "cc";

// AStar.ts
export interface AStarNode {
    x: number;
    y: number;
    walkable: boolean;
    g: number;
    h: number;
    f: number;
    parent: AStarNode | null;
}

// AStar.ts
export class AStar {
    private grid: AStarNode[][];
    private openList: AStarNode[];
    private closedList: AStarNode[];
    private maxSearchSteps: number = 1000; // 添加最大搜索步数限制

    constructor(private gridWidth: number, private gridHeight: number, private cellSize: number) {
        this.initGrid();
    }

    private initGrid(): void {
        this.grid = [];
        for (let x = 0; x < this.gridWidth; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.gridHeight; y++) {
                this.grid[x][y] = {
                    x: x,
                    y: y,
                    walkable: true,
                    g: 0,
                    h: 0,
                    f: 0,
                    parent: null
                };
            }
        }
    }

    // 设置障碍物
    public setObstacle(worldPos: Vec3, radius: number = 1): void {
        const gridPos = this.worldToGrid(worldPos);

        for (let x = Math.max(0, gridPos.x - radius); x <= Math.min(this.gridWidth - 1, gridPos.x + radius); x++) {
            for (let y = Math.max(0, gridPos.y - radius); y <= Math.min(this.gridHeight - 1, gridPos.y + radius); y++) {
                this.grid[x][y].walkable = false;
            }
        }
    }

    // 清除所有障碍物
    public clearObstacles(): void {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                this.grid[x][y].walkable = true;
            }
        }
    }

    // 世界坐标转网格坐标
    private worldToGrid(worldPos: Vec3): { x: number, y: number } {
        return {
            x: Math.floor((worldPos.x + (this.gridWidth * this.cellSize) / 2) / this.cellSize),
            y: Math.floor((worldPos.z + (this.gridHeight * this.cellSize) / 2) / this.cellSize)
        };
    }

    // 网格坐标转世界坐标
    private gridToWorld(gridPos: { x: number, y: number }): Vec3 {
        return new Vec3(
            gridPos.x * this.cellSize - (this.gridWidth * this.cellSize) / 2,
            0,
            gridPos.y * this.cellSize - (this.gridHeight * this.cellSize) / 2
        );
    }

    // 寻找路径 - 添加性能保护
    public findPath(startWorldPos: Vec3, endWorldPos: Vec3): Vec3[] | null {
        const start = this.worldToGrid(startWorldPos);
        const end = this.worldToGrid(endWorldPos);

        console.log(`AStar: Finding path from grid(${start.x},${start.y}) to grid(${end.x},${end.y})`);

        // 检查起点和终点是否有效
        if (!this.isValidGridPos(start.x, start.y) || !this.isValidGridPos(end.x, end.y)) {
            console.warn('AStar: Start or end position out of grid bounds');
            return null;
        }

        if (!this.grid[start.x][start.y].walkable) {
            console.warn('AStar: Start position is blocked');
            return null;
        }

        if (!this.grid[end.x][end.y].walkable) {
            console.warn('AStar: End position is blocked');
            return null;
        }

        // 如果起点和终点相同，直接返回
        if (start.x === end.x && start.y === end.y) {
            console.log('AStar: Start and end are the same');
            return [this.gridToWorld(start)];
        }

        this.openList = [];
        this.closedList = [];

        const startNode = this.grid[start.x][start.y];
        const endNode = this.grid[end.x][end.y];

        this.openList.push(startNode);
        let searchSteps = 0;

        while (this.openList.length > 0) {
            searchSteps++;

            // 防止无限循环
            if (searchSteps > this.maxSearchSteps) {
                console.warn(`AStar: Exceeded max search steps (${this.maxSearchSteps})`);
                return null;
            }

            // 获取F值最小的节点
            let currentNode = this.openList[0];
            let currentIndex = 0;

            for (let i = 1; i < this.openList.length; i++) {
                if (this.openList[i].f < currentNode.f) {
                    currentNode = this.openList[i];
                    currentIndex = i;
                }
            }

            // 从openList移除，加入closedList
            this.openList.splice(currentIndex, 1);
            this.closedList.push(currentNode);

            // 找到目标
            if (currentNode === endNode) {
                console.log(`AStar: Path found in ${searchSteps} steps`);
                const path: Vec3[] = [];
                let current: AStarNode | null = currentNode;
                while (current !== null) {
                    path.push(this.gridToWorld({ x: current.x, y: current.y }));
                    current = current.parent;
                }
                return path.reverse();
            }

            // 获取邻居节点
            const neighbors = this.getNeighbors(currentNode);

            for (const neighbor of neighbors) {
                if (this.closedList.includes(neighbor) || !neighbor.walkable) {
                    continue;
                }

                const gScore = currentNode.g + 1;
                let gScoreIsBest = false;

                if (!this.openList.includes(neighbor)) {
                    gScoreIsBest = true;
                    neighbor.h = this.heuristic(neighbor, endNode);
                    this.openList.push(neighbor);
                } else if (gScore < neighbor.g) {
                    gScoreIsBest = true;
                }

                if (gScoreIsBest) {
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }

        console.warn(`AStar: No path found after ${searchSteps} steps`);
        return null;
    }

    private getNeighbors(node: AStarNode): AStarNode[] {
        const neighbors: AStarNode[] = [];
        const directions = [
            { x: 0, y: 1 },    // 上
            { x: 1, y: 0 },    // 右
            { x: 0, y: -1 },   // 下
            { x: -1, y: 0 },   // 左
            // 暂时注释掉对角线移动，减少复杂度
            // { x: 1, y: 1 },    // 右上
            // { x: 1, y: -1 },   // 右下
            // { x: -1, y: 1 },   // 左上
            // { x: -1, y: -1 }   // 左下
        ];

        for (const dir of directions) {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;

            if (this.isValidGridPos(newX, newY)) {
                neighbors.push(this.grid[newX][newY]);
            }
        }

        return neighbors;
    }

    private isValidGridPos(x: number, y: number): boolean {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }

    private heuristic(node: AStarNode, endNode: AStarNode): number {
        // 使用曼哈顿距离
        return Math.abs(node.x - endNode.x) + Math.abs(node.y - endNode.y);
    }

    // 调试方法：打印网格状态
    public debugGrid(): void {
        let gridStr = 'Grid State:\n';
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            for (let x = 0; x < this.gridWidth; x++) {
                gridStr += this.grid[x][y].walkable ? '.' : 'X';
            }
            gridStr += '\n';
        }
        console.log(gridStr);
    }
}
// import { ClosedList, Fraction, Grid, MinHeap, OpenList } from './Utils';

// export enum Mode {
//     /**
//      * 适用: 正方形
//      * 用途: 四方向寻路
//      */
//     Square_Four = 0,
//     /**
//      * 适用: 正方形
//      * 用途: 八方向寻路
//      */
//     Square_Eight,
//     /**
//      * 适用: 正方形
//      * 用途: 自由方向寻路
//      */
//     Square_Free,
//     /**
//      * 适用: 正六边形
//      * 用途: 六方向寻路
//      */
//     Hexagon_Six,
// }

// function manhattan(node: Grid, target: Grid): number {
//     // 使用曼哈顿距离作为启发式函数
//     return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
// }

// /**
//  * AStar寻路算法
//  * @description 保证计算一致性, 可用于帧同步
//  */
// export class AStar {
//     static Mode = Mode;

//      width = 0;
//      height = 0;
//      map: Grid[][] = [];
//     private openList: OpenList = null;
//     private closedList = new ClosedList();
//     private cost: (curr: Grid, next: Grid, cost: number) => number;
//     private heuristic: (node: Grid, target: Grid) => number;

//     constructor(width: number, height: number, opts?: {
//         /**
//          * 是否使用最小堆算法
//          */
//         useMinHeap?: boolean,
//         /**
//          * 移动代价倍数
//          * - 默认使用内部计算的g值
//          * @param curr 当前节点
//          * @param node 节点
//          * @param cost 内部计算的g值
//          * @returns g值(如果值<0，则表示当前不可通行)
//          */
//         cost?: (curr: Grid, node: Grid, cost: number) => number,
//         /**
//          * 启发函数
//          * - 默认为manhattan
//          * @param node 节点
//          * @param target 最终目标节点
//          * @returns h值
//          */
//         heuristic?: (node: Grid, target: Grid) => number
//     }) {
//         this.width = width;
//         this.height = height;
//         this.cost = opts?.cost;
//         this.heuristic = opts?.heuristic || manhattan;

//         if (opts?.useMinHeap) {
//             this.openList = new MinHeap();
//         } else {
//             this.openList = new OpenList();
//         }

//         for (let x = 0; x < width; x++) {
//             this.map[x] = [];
//             for (let y = 0; y < height; y++) {
//                 // this.map[x][y] = new Grid(x, y, true);
//                 this.map[x].push(new Grid(x, y, true));
//             }
//         }
//     }

//     private getNeighbors(node: Grid, mode: Mode): Grid[] {
//         const x = node.x;
//         const y = node.y;

//         const minX = 0;
//         const minY = 0;
//         const maxX = this.width - 1;
//         const maxY = this.height - 1;

//         const neighbors: Grid[] = [];

//         if (mode === Mode.Square_Four || mode === Mode.Square_Eight || mode === Mode.Square_Free) {
//             // 上
//             if (x < maxX) neighbors.push(this.map[x + 1][y]);
//             // 右
//             if (y < maxY) neighbors.push(this.map[x][y + 1]);
//             // 下
//             if (y > minY) neighbors.push(this.map[x][y - 1]);
//             // 左
//             if (x > minX) neighbors.push(this.map[x - 1][y]);

//             // 斜向要避免穿墙
//             if (mode === Mode.Square_Eight || mode === Mode.Square_Free) {
//                 // 左上
//                 if (x > minX && y < maxY
//                     // 左和上都需要可通行
//                     && this.isWalkable(x - 1, y) && this.isWalkable(x, y + 1))
//                     neighbors.push(this.map[x - 1][y + 1]);
//                 // 右上
//                 if (x < maxX && y < maxY
//                     // 右和上都需要可通行
//                     && this.isWalkable(x + 1, y) && this.isWalkable(x, y + 1))
//                     neighbors.push(this.map[x + 1][y + 1]);
//                 // 右下
//                 if (x < maxX && y > minY
//                     // 右和下都需要可通行
//                     && this.isWalkable(x + 1, y) && this.isWalkable(x, y - 1))
//                     neighbors.push(this.map[x + 1][y - 1]);
//                 // 左下
//                 if (x > minX && y > minY
//                     // 左和下都需要可通行
//                     && this.isWalkable(x - 1, y) && this.isWalkable(x, y - 1))
//                     neighbors.push(this.map[x - 1][y - 1]);
//             }
//         } else {
//             // 六个单元的分布。
//             // 对单行（i行）的单元而言，单元(i,j)周边的六个是(i-1,j)、(i-1,j+1)、(i,j-1)、(i,j+1)、(i+1,j)、(i+1,j+1)
//             // 对双行（i行）的单元而言，单元(i,j)周边的六个是(i-1,j-1)、(i-1,j)、(i,j-1)、(i,j+1)、(i+1,j-1)、(i+1,j)
//             // 这样一来，其他的都可以套用A*了
//             const xCenter = x / 2;
//             if (xCenter === Math.floor(xCenter)) {
//                 // 双行
//                 if (x > minX && y > minY) neighbors.push(this.map[x - 1][y - 1]);
//                 if (x > minX) neighbors.push(this.map[x - 1][y]);
//                 if (y > minY) neighbors.push(this.map[x][y - 1]);
//                 if (y < maxY) neighbors.push(this.map[x][y + 1]);
//                 if (x < maxX && y > minY) neighbors.push(this.map[x + 1][y - 1]);
//                 if (x < maxX) neighbors.push(this.map[x + 1][y]);
//             } else {
//                 // 单行
//                 if (x > minX) neighbors.push(this.map[x - 1][y]);
//                 if (x > minX && y < maxY) neighbors.push(this.map[x - 1][y + 1]);
//                 if (y > minY) neighbors.push(this.map[x][y - 1]);
//                 if (y < maxY) neighbors.push(this.map[x][y + 1]);
//                 if (x < maxX) neighbors.push(this.map[x + 1][y]);
//                 if (x < maxX && y < maxY) neighbors.push(this.map[x + 1][y + 1]);
//             }
//         }

//         return neighbors;
//     }

//     /**
//      * 搜索路径
//      */
//     findPath(startX: number, startY: number, targetX: number, targetY: number, mode: Mode = Mode.Square_Four): Grid[] {
//         return this.findPathStep(startX, startY, targetX, targetY, mode)(-1);
//     }

//     /**
//      * 异步搜索路径
//      * @param stepCount 每次迭代搜索次数
//      */
//     async findPathAsync(startX: number, startY: number, targetX: number, targetY: number, mode: Mode = Mode.Square_Four, stepCount: number = 50): Promise<Grid[]> {
//         const step = this.findPathStep(startX, startY, targetX, targetY, mode);

//         let count = 0;
//         while (count++ < 10000) {
//             const path = step(stepCount);
//             if (path) return path;
//             await new Promise(next => setTimeout(next, 0));
//         }

//         return [];
//     }

//     /**
//      * 分步搜索路径
//      */
//     findPathStep(startX: number, startY: number, targetX: number, targetY: number, mode: Mode = Mode.Square_Four) {
//         const startNode = this.map[startX][startY];
//         const targetNode = this.map[targetX][targetY];

//         this.openList.clear();
//         this.closedList.clear();
//         this.openList.insert(startNode);

//         let result: Grid[] = null;

//         /**
//          * 迭代器
//          * @param stepCount 每次迭代搜索次数
//          */
//         return (stepCount = 50) => {
//             if (result) {
//                 return result;
//             }
//             for (let index = 0; (stepCount < 0 || index < stepCount) && this.openList.size(); index++) {
//                 // 从openList中选择f值最小的节点
//                 // 将当前节点从openList中移除，并加入closedList
//                 const currentNode = this.openList.extractMin() as Grid;
//                 this.closedList.insert(currentNode);

//                 // 如果当前节点为目标节点，则返回路径
//                 if (currentNode === targetNode) {
//                     result = this.getPath(startNode, targetNode);
//                     if (mode === Mode.Square_Free) {
//                         result = this.getFunnelPath(result);
//                     }
//                     return result;
//                 }

//                 // 获取当前节点的相邻节点
//                 const neighbors = this.getNeighbors(currentNode, mode);

//                 for (const neighbor of neighbors) {
//                     if (!neighbor.walkable) {
//                         continue;
//                     }

//                     // 如果相邻节点已经在closedList中，则跳过
//                     if (neighbor.inClose) {
//                         continue;
//                     }

//                     // 移动代价
//                     const _cost = (mode === Mode.Square_Eight || mode === Mode.Square_Free) ? (
//                         (neighbor.x === currentNode.x || neighbor.y === currentNode.y) ? 1000 : 1414
//                     ) : 1000;

//                     const cost = (this.cost ? this.cost(currentNode, neighbor, _cost) : _cost);
//                     // 代价小于0，则跳过
//                     if (cost < 0) continue;

//                     // 计算相邻节点的g值
//                     const g = currentNode.g + cost;

//                     // 如果相邻节点不在openList中，则加入openList，并计算其h值和f值
//                     if (neighbor.inOpen) {
//                         // 如果相邻节点已经在openList中，并且新的g值更小，则更新其g值和f值，并更新其父节点为当前节点
//                         if (g < neighbor.g) {
//                             neighbor.g = g;
//                             neighbor.f = neighbor.g + neighbor.h;
//                             neighbor.parent = currentNode;
//                         }
//                     } else {
//                         neighbor.g = g;
//                         neighbor.h = this.heuristic(neighbor, targetNode);
//                         neighbor.f = neighbor.g + neighbor.h;
//                         neighbor.parent = currentNode;
//                         this.openList.insert(neighbor);
//                     }
//                 }
//             }
//             if (this.openList.size() === 0) {
//                 // 没有查询到路径
//                 result = [];
//                 return result;
//             }
//             // 还没有结果，继续迭代
//             return null;
//         };
//     }

//     /**
//      * 漏斗算法
//      */
//     private getFunnelPath(path: Grid[]): Grid[] {
//         if (path.length < 3) {
//             return path; // 如果路径节点少于3个，无需进行平滑处理
//         }
//         // 平滑后的路径节点数组，初始值为第一个节点
//         const smoothedPath: Grid[] = [path[0]];
//         // 平滑处理起始节点的索引
//         let startIndex = 0;
//         // 平滑处理结束节点的索引
//         let endIndex = 2;

//         while (endIndex < path.length) {
//             // 起始节点
//             const startNode = path[startIndex];
//             // 中间节点
//             const middleNode = path[endIndex - 1];
//             // 结束节点
//             const endNode = path[endIndex];

//             if (!this.isClearPath(startNode, endNode)) {
//                 // 如果起始节点和结束节点之间存在障碍物，则将中间节点添加到平滑后的路径中，并更新起始节点的索引为中间节点的索引
//                 smoothedPath.push(middleNode);
//                 startIndex = endIndex - 1;
//             }

//             endIndex++; // 更新结束节点的索引
//         }

//         smoothedPath.push(path[path.length - 1]); // 将最后一个节点添加到平滑后的路径中

//         return smoothedPath; // 返回平滑后的路径
//     }

//     private sx = new Fraction();
//     private sy = new Fraction();
//     private isClearPath(gridA: Grid, gridB: Grid): boolean {
//         const minX = Math.min(gridA.x, gridB.x);
//         const maxX = Math.max(gridA.x, gridB.x);
//         const minY = Math.min(gridA.y, gridB.y);
//         const maxY = Math.max(gridA.y, gridB.y);

//         if (minX === maxX || minY === maxY) {
//             for (let x = minX; x <= maxX; x++) {
//                 for (let y = minY; y <= maxY; y++) {
//                     if (!this.isWalkable(x, y)) {
//                         return false;
//                     }
//                 }
//             }
//             return true;
//         }

//         // 差绝对值
//         const dx = maxX - minX;
//         const dy = maxY - minY;

//         // 迭代次数
//         const step = Math.max(dx, dy);

//         for (let index = 1, lastX = minX, lastY = minY; index <= step; index++) {
//             // 迭代增量
//             this.sx.set(dx, step);
//             this.sy.set(dy, step);

//             // 迭代总量
//             this.sx.mul(index);
//             this.sy.mul(index);

//             // 当前量(向上取整)
//             const currX = this.sx.shang + minX + (this.sx.yu === 0 ? 0 : 1);
//             const currY = this.sy.shang + minY + (this.sy.yu === 0 ? 0 : 1);

//             for (let x = lastX; x <= currX; x++) {
//                 for (let y = lastY; y <= currY; y++) {
//                     if (!this.isWalkable(x, y)) {
//                         return false;
//                     }
//                 }
//             }

//             // 向下取整
//             lastX = this.sx.shang + minX;
//             lastY = this.sy.shang + minY;
//         }

//         return true;
//     }

//     private getPath(startNode: Grid, targetNode: Grid): Grid[] {
//         const path: Grid[] = [];
//         let currentNode: Grid | null = targetNode;

//         while (currentNode !== startNode) {
//             path.unshift(currentNode);
//             currentNode = currentNode.parent;
//         }

//         path.unshift(startNode);

//         return path;
//     }

//     /**
//      * 是否可通行
//      */
//     isWalkable(x: number, y: number) {
//         return !!this.map[x] && !!this.map[x][y] && this.map[x][y].walkable;
//     }

//     /**
//      * 是否障碍物
//      */
//     isObstacle(x: number, y: number) {
//         return !!this.map[x] && !!this.map[x][y] && !this.map[x][y].walkable;
//     }

//     /**
//      * 添加障碍物
//      */
//     addObstacle(x: number, y: number) {
//         this.map[x][y].walkable = false;
//     }

//     /**
//      * 移除障碍物
//      */
//     removeObstacle(x: number, y: number) {
//         this.map[x][y].walkable = true;
//     }
// }

// interface Point {
//     x: number;
//     y: number;
// }

// /**
//  * 路径平滑(不适用于Square_Free模式产生的结果)
//  * @description 无法保证计算一致性
//  * @param points 路径列表
//  * @param smoothingFactor 平滑因子
//  */
// export function smoothPath(points: Point[], smoothingFactor: number = 0.5): Point[] {
//     const smoothedPath: Point[] = [];

//     for (let i = 0; i < points.length; i++) {
//         const currentPoint = points[i];
//         const nextPoint = points[i + 1];

//         if (nextPoint) {
//             const deltaX = nextPoint.x - currentPoint.x;
//             const deltaY = nextPoint.y - currentPoint.y;

//             const smoothedX = currentPoint.x + deltaX * smoothingFactor;
//             const smoothedY = currentPoint.y + deltaY * smoothingFactor;

//             smoothedPath.push({ x: smoothedX, y: smoothedY });
//         } else {
//             smoothedPath.push({ x: currentPoint.x, y: currentPoint.y });
//         }
//     }

//     return smoothedPath;
// }