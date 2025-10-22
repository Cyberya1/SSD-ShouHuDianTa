
import { Enum } from 'cc';
import { Node } from 'cc';
import { _decorator, Component, Vec3, CCFloat, MeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

enum LayoutType {
    HORIZONTAL = 0,
    VERTICAL = 1,
    GRID = 2
}

enum LayoutAlignment {
    LEFT = 0,
    CENTER = 1,
    RIGHT = 2
}

@ccclass('ILayout3D')
export class ILayout3D extends Component {

    @property({
        type: Enum(LayoutType),
        tooltip: '布局类型：水平、垂直、网格'
    })
    layoutType: LayoutType = LayoutType.HORIZONTAL;

    @property({ visible: true, tooltip: '起始位置' })
    startPosition: Vec3 = new Vec3(0, 0, 0);

    @property({ type: CCFloat, tooltip: 'X轴间距' })
    spacingX: number = 1;

    @property({ type: CCFloat, tooltip: 'Y轴间距' })
    spacingY: number = 1;

    @property({ type: CCFloat, tooltip: 'Z轴间距' })
    spacingZ: number = 1;

    @property({
        type: CCFloat,
        tooltip: '网格布局每行的元素数量',
        visible: function (this: ILayout3D) { return this.layoutType === LayoutType.GRID; }
    })
    gridColumns: number = 3;

    @property({
        type: CCFloat,
        tooltip: '网格布局行间距',
        visible: function (this: ILayout3D) { return this.layoutType === LayoutType.GRID; }
    })
    gridRowSpacing: number = 1;

    @property({
        type: CCFloat,
        tooltip: '网格布局列间距',
        visible: function (this: ILayout3D) { return this.layoutType === LayoutType.GRID; }
    })
    gridColumnSpacing: number = 1;

    @property({
        type: Enum(LayoutAlignment),
        tooltip: '对齐方式：左对齐、居中、右对齐',
        visible: function (this: ILayout3D) { return this.layoutType !== LayoutType.GRID; }
    })
    // alignment: 'left' | 'center' | 'right' = 'center';
    alignment: LayoutAlignment = LayoutAlignment.CENTER;

    @property({ tooltip: '启用编辑器实时更新' })
    edit_update = false;

    /**
     * 获取节点的边界框尺寸
     */
    private getNodeSize(node: Node): Vec3 {
        const meshRenderer = node.getComponent(MeshRenderer);
        if (meshRenderer && meshRenderer.enabled) {
            // 获取模型的世界边界
            const model = meshRenderer.model;
            if (model && model.worldBounds) {
                const bounds = model.worldBounds;
                // 使用 halfExtents 计算完整尺寸 (halfExtents * 2)
                const size = new Vec3();
                size.x = bounds.halfExtents.x * 2;
                size.y = bounds.halfExtents.y * 2;
                size.z = bounds.halfExtents.z * 2;
                return size;
            }
        }

        // 如果没有MeshRenderer，尝试获取子节点的总边界
        let min = new Vec3(Infinity, Infinity, Infinity);
        let max = new Vec3(-Infinity, -Infinity, -Infinity);
        let hasValidChild = false;

        // 递归获取所有子节点的边界
        const calculateNodeBounds = (currentNode: Node) => {
            const currentMeshRenderer = currentNode.getComponent(MeshRenderer);
            if (currentMeshRenderer && currentMeshRenderer.enabled) {
                const model = currentMeshRenderer.model;
                if (model && model.worldBounds) {
                    const bounds = model.worldBounds;
                    // 计算实际的最小最大点
                    const minPoint = new Vec3(
                        bounds.center.x - bounds.halfExtents.x,
                        bounds.center.y - bounds.halfExtents.y,
                        bounds.center.z - bounds.halfExtents.z
                    );
                    const maxPoint = new Vec3(
                        bounds.center.x + bounds.halfExtents.x,
                        bounds.center.y + bounds.halfExtents.y,
                        bounds.center.z + bounds.halfExtents.z
                    );

                    Vec3.min(min, min, minPoint);
                    Vec3.max(max, max, maxPoint);
                    hasValidChild = true;
                }
            }

            // 递归处理子节点
            for (let child of currentNode.children) {
                calculateNodeBounds(child);
            }
        };

        calculateNodeBounds(node);

        if (hasValidChild) {
            const size = new Vec3();
            size.x = max.x - min.x;
            size.y = max.y - min.y;
            size.z = max.z - min.z;
            return size;
        }

        // 默认大小
        return new Vec3(1, 1, 1);
    }

    /**
     * 获取所有子节点的最大尺寸
     */
    private getMaxChildSize(): Vec3 {
        if (this.node.children.length === 0) return new Vec3(1, 1, 1);

        let maxSize = new Vec3(0, 0, 0);

        for (let i = 0; i < this.node.children.length; i++) {
            const childSize = this.getNodeSize(this.node.children[i]);
            maxSize.x = Math.max(maxSize.x, childSize.x);
            maxSize.y = Math.max(maxSize.y, childSize.y);
            maxSize.z = Math.max(maxSize.z, childSize.z);
        }

        return maxSize;
    }

    /**
     * 水平布局
     */
    private updateHorizontalLayout(): void {
        const children = this.node.children;
        if (children.length === 0) return;

        let totalWidth = 0;
        const nodeSizes: Vec3[] = [];

        // 计算总宽度和缓存每个节点的大小
        for (let i = 0; i < children.length; i++) {
            const childSize = this.getNodeSize(children[i]);
            nodeSizes.push(childSize);
            totalWidth += childSize.x + (i > 0 ? this.spacingX : 0);
        }

        let currentX = this.startPosition.x;

        // 根据对齐方式调整起始位置
        if (this.alignment === LayoutAlignment.CENTER) {
            currentX = -totalWidth / 2;
        } else if (this.alignment === LayoutAlignment.RIGHT) {
            currentX = -totalWidth;
        }

        for (let i = 0; i < children.length; i++) {
            const childSize = nodeSizes[i];
            const newPos = new Vec3(
                currentX + childSize.x / 2,
                this.startPosition.y,
                this.startPosition.z
            );
            children[i].setPosition(newPos);
            currentX += childSize.x + this.spacingX;
        }
    }

    /**
     * 垂直布局
     */
    private updateVerticalLayout(): void {
        const children = this.node.children;
        if (children.length === 0) return;

        let totalHeight = 0;
        const nodeSizes: Vec3[] = [];

        // 计算总高度和缓存每个节点的大小
        for (let i = 0; i < children.length; i++) {
            const childSize = this.getNodeSize(children[i]);
            nodeSizes.push(childSize);
            totalHeight += childSize.y + (i > 0 ? this.spacingY : 0);
        }

        let currentY = this.startPosition.y;

        // 根据对齐方式调整起始位置（垂直布局通常从上到下）
        if (this.alignment === LayoutAlignment.CENTER) {
            currentY = totalHeight / 2;
        } else if (this.alignment === LayoutAlignment.RIGHT) {
            currentY = totalHeight;
        } else {
            // 左对齐（从上到下）
            currentY = 0;
        }

        for (let i = 0; i < children.length; i++) {
            const childSize = nodeSizes[i];
            const newPos = new Vec3(
                this.startPosition.x,
                currentY - childSize.y / 2,
                this.startPosition.z
            );
            children[i].setPosition(newPos);
            currentY -= childSize.y + this.spacingY;
        }
    }

    /**
     * 网格布局
     */
    private updateGridLayout(): void {
        const children = this.node.children;
        if (children.length === 0) return;

        const maxSize = this.getMaxChildSize();
        const rows = Math.ceil(children.length / this.gridColumns);

        // 计算网格总尺寸
        const gridWidth = this.gridColumns * (maxSize.x + this.gridColumnSpacing) - this.gridColumnSpacing;
        const gridHeight = rows * (maxSize.y + this.gridRowSpacing) - this.gridRowSpacing;

        for (let i = 0; i < children.length; i++) {
            const row = Math.floor(i / this.gridColumns);
            const column = i % this.gridColumns;

            const newPos = new Vec3(
                this.startPosition.x + column * (maxSize.x + this.gridColumnSpacing) - gridWidth / 2 + maxSize.x / 2,
                this.startPosition.y - row * (maxSize.y + this.gridRowSpacing) + gridHeight / 2 - maxSize.y / 2,
                this.startPosition.z
            );
            children[i].setPosition(newPos);
        }
    }

    /**
     * 更新布局
     */
    public updateLayout(): void {
        switch (this.layoutType) {
            case LayoutType.HORIZONTAL:
                this.updateHorizontalLayout();
                break;
            case LayoutType.VERTICAL:
                this.updateVerticalLayout();
                break;
            case LayoutType.GRID:
                this.updateGridLayout();
                break;
        }
    }

    protected onLoad(): void {
        this.updateLayout();
    }

    protected start(): void {
        this.updateLayout();
    }

    protected update(dt: number): void {
        if (this.edit_update) {
            this.updateLayout();
        }
    }

    /**
     * 编辑器模式下属性变化时调用
     */
    protected onEnable(): void {
        this.updateLayout();
    }

    /**
     * 公共方法：手动刷新布局
     */
    public refresh(): void {
        this.updateLayout();
    }

    /**
     * 添加节点并刷新布局
     */
    public addChild(node: Node): void {
        this.node.addChild(node);
        this.updateLayout();
    }

    /**
     * 移除节点并刷新布局
     */
    public removeChild(node: Node): void {
        this.node.removeChild(node);
        this.updateLayout();
    }

    /**
     * 清空所有子节点并刷新布局
     */
    public removeAllChildren(): void {
        this.node.removeAllChildren();
        this.updateLayout();
    }
}