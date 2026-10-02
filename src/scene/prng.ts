/**
 * prng.ts — 种子化伪随机数生成器 (mulberry32)
 *
 * 为什么不用 Math.random：
 *  1. React Compiler 的 purity 规则正确地指出——渲染期间调用 Math.random
 *     是不纯的，重渲染会得到不同结果。
 *  2. 更重要的是，对一件「规则集合体」的生成艺术作品而言，可复现性本身
 *     就是价值：同一个种子永远长出同一片晶格，便于调试与视觉一致性。
 *
 * mulberry32 是极轻量、分布良好的 32 位 PRNG。
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
