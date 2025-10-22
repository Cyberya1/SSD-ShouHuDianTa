export class Fraction {
    private _shang: number = 0;
    public get shang(): number {
        this.update();
        return this._shang;
    }

    private _yu: number = 0;
    public get yu(): number {
        this.update();
        return this._yu;
    }

    private needUpdate = false;

    /**
     * 分数
     * @param up 分子 整数
     * @param down 分母 整数
     */
    constructor(private up: number = 0, private down: number = 1) {
        this.set(up, down);
    }

    private update() {
        if (this.needUpdate === false) return this;
        this.needUpdate = false;

        let up = this.up;
        let down = this.down;

        if (down === 0) {
            this._shang = up === 0
                ? Number.NaN
                : up > 0
                    ? Infinity
                    : -Infinity;
            this._yu = 0;
            return this;
        }
        if (up < down) {
            this._shang = 0;
            this._yu = up;
            return this;
        }
        if (up === down) {
            this._shang = 1;
            this._yu = 0;
            return this;
        }
        let shang = Math.floor(up / down) - 1;
        up = up - (down * shang);
        while (up >= down) {
            shang += 1;
            up -= down;
        }
        this._shang = shang;
        this._yu = up;
        return this;
    }

    set(up: number, down: number) {
        this.up = up;
        this.down = down;
        this.needUpdate = true;
        return this;
    }

    /**
     * 加法
     * @param int 整数
     * @returns 
     */
    add(int: number) {
        this.set(this.up + int * this.down, this.down);
        return this;
    }

    /**
     * 乘法
     * @param int 整数
     * @returns 
     */
    mul(int: number) {
        this.set(this.up * int, this.down);
        return this;
    }
}

export class Grid {
    x: number = 0;
    y: number = 0;
    g: number = 0;
    h: number = 0;
    f: number = 0;
    walkable: boolean = false;
    parent: Grid | null = null;

    inOpen: boolean = false;
    inClose: boolean = false;

    constructor(x: number, y: number, walkable: boolean) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.walkable = walkable;
        this.parent = null;
    }
}

export class OpenList {
    protected heap: Grid[] = [];

    /**
     * 插入一个元素
     * @param value 要插入的 Grid 对象
     */
    public insert(value: Grid): void {
        value.inOpen = true;
        this.heap.push(value);
    }

    /**
     * 移除并返回最小值
     */
    public extractMin(): Grid | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }

        // 从openList中选择f值最小的节点
        let minNodeIndex = 0;
        const minNode = this.heap.reduce((minNode, node, index) => {
            if (node.f < minNode.f) {
                minNodeIndex = index;
                return node;
            }
            return minNode;
        });

        // 将当前节点从openList中移除，并加入closedList
        if (this.heap.length >= 2) {
            this.heap[minNodeIndex] = this.heap[this.heap.length - 1];
        }
        this.heap.pop();
        minNode.inOpen = false;

        return minNode;
    }

    /**
     * 返回大小
     */
    public size(): number {
        return this.heap.length;
    }

    /**
     * 清理内存
     */
    public clear(): void {
        if (this.heap.length === 0) return;
        this.heap.forEach(grid => {
            grid.inOpen = false;
            grid.parent = null;
        });
        this.heap = [];
    }
}

export class ClosedList {
    protected heap: Grid[] = [];

    /**
     * 插入一个元素
     * @param grid 要插入的 Grid 对象
     */
    public insert(grid: Grid): void {
        grid.inClose = true;
        this.heap.push(grid);
    }

    /**
     * 返回大小
     * @returns 堆的大小
     */
    public size(): number {
        return this.heap.length;
    }

    /**
     * 清理内存
     */
    public clear(): void {
        if (this.heap.length === 0) return;
        this.heap.forEach(grid => {
            grid.inClose = false
            grid.parent = null;
        });
        this.heap = [];
    }
}

/**
 * openList的最小堆版本
 */
export class MinHeap extends OpenList {
    private fraction = new Fraction();
    /**
     * 获取父节点的索引
     */
    private getParentIndex(index: number): number {
        return this.fraction.set(index - 1, 2).shang;
    }

    /**
     * 获取左子节点的索引
     */
    private getLeftChildIndex(index: number): number {
        return 2 * index + 1;
    }

    /**
     * 获取右子节点的索引
     */
    private getRightChildIndex(index: number): number {
        return 2 * index + 2;
    }

    /**
     * 交换数组中两个元素的位置
     */
    private swap(index1: number, index2: number): void {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    /**
     * 递归上移操作，将值与父节点比较并交换，直到满足最小堆的性质
     */
    private siftUp(index: number): void {
        if (index === 0) {
            return;
        }

        const parentIndex = this.getParentIndex(index);
        if (this.heap[parentIndex].f > this.heap[index].f) {
            this.swap(parentIndex, index);
            this.siftUp(parentIndex);
        }
    }

    /**
     * 递归下移操作，将值与子节点中较小的节点比较并交换，直到满足最小堆的性质
     */
    private siftDown(index: number): void {
        const leftChildIndex = this.getLeftChildIndex(index);
        const rightChildIndex = this.getRightChildIndex(index);
        let smallestChildIndex = index;

        if (leftChildIndex < this.heap.length && this.heap[leftChildIndex].f < this.heap[smallestChildIndex].f) {
            smallestChildIndex = leftChildIndex;
        }

        if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].f < this.heap[smallestChildIndex].f) {
            smallestChildIndex = rightChildIndex;
        }

        if (smallestChildIndex !== index) {
            this.swap(smallestChildIndex, index);
            this.siftDown(smallestChildIndex);
        }
    }

    /**
     * 向堆中插入一个元素
     * @param grid 要插入的 Grid 对象
     */
    public insert(grid: Grid): void {
        this.heap.push(grid);
        this.siftUp(this.heap.length - 1);
        grid.inOpen = true;
    }

    /**
     * 移除并返回堆中最小值
     * @returns 堆中的最小值 (Grid 对象)，如果堆为空则返回 undefined
     */
    public extractMin(): Grid | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }

        const minValue = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.siftDown(0);
        minValue.inOpen = false;

        return minValue;
    }
}
