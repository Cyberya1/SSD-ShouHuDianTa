// RVOConfig.ts
import Vector2 from "./Vector2";

export default class RVOConfig {
    /**代理对象之间的距离 */
    public static neighborDist = 150; // 增加邻居检测距离
    /**代理对象的半径 */
    public static radius = 150;
    /**代理对象的最大移动速度 */
    public static maxSpeed = 300; // 增加最大速度
    /**代理对象的初始速度 */
    public static velocity = new Vector2(0, 0);
    /**最大邻居数 */
    public static maxNeighbors = 30; // 增加最大邻居数
    /**安全单位时间，它乘以最大速度就是agent的避让探针，值越大，就会越早做出避让行为 */
    public static timeHorizon = 20; // 调整时间视野
    /**与timeHorizon类似，只针对障碍物 */
    public static timeHorizonObst = 20;

    /**步骤帧 - 减小时间步长提高精度 */
    public static gameTimeStep = 0.01;
}