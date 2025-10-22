import { Node } from "cc";

export class Tools {

    /**
     * 修改节点的父节点，保持世界矩阵不变
     * @param node 要修改父节点的节点
     * @param newParent 新的父节点
     */
    public static changeParentKeepWorldMatrix(node: Node, newParent: Node): void {
        if (!node || !newParent) {
            console.warn('节点或父节点为空');
            return;
        }

        // 保存当前的世界矩阵
        const worldMatrix = node.worldMatrix;

        // 修改父节点
        node.parent = newParent;

        // 设置世界矩阵
        node.matrix = newParent.worldMatrix.clone().invert().multiply(worldMatrix);
    }

}


