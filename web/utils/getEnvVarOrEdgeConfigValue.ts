// utils/getEnvVarOrEdgeConfigValue.ts
import { get } from "@vercel/edge-config"; // 确保你安装了 @vercel/edge-config 依赖

export const getEnvVarOrEdgeConfigValue = async (name: string) => {
  if (process.env.EDGE_CONFIG) {
    return await get<string>(name);
  }

  return process.env[name];
};