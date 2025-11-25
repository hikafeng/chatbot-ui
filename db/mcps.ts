import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getMcpById = async (mcpId: string) => {
  const { data: mcp, error } = await supabase
    .from("mcps")
    .select("*")
    .eq("id", mcpId)
    .single()

  if (!mcp) {
    throw new Error(error.message)
  }

  return mcp
}

export const getMcpWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      mcps (*)
    `
    )
    .eq("id", workspaceId)
    .single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getMcpWorkspacesByMcpId = async (mcpId: string) => {
  const { data: mcp, error } = await supabase
    .from("mcps")
    .select(
      `
      id, 
      name, 
      workspaces (*)
    `
    )
    .eq("id", mcpId)
    .single()

  if (!mcp) {
    throw new Error(error.message)
  }

  return mcp
}

export const createMcp = async (
  mcp: TablesInsert<"mcps">,
  workspace_id: string
) => {
  const { data: createdMcp, error } = await supabase
    .from("mcps")
    .insert([mcp])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createMcpWorkspace({
    user_id: createdMcp.user_id,
    mcp_id: createdMcp.id,
    workspace_id
  })

  return createdMcp
}

export const createMcps = async (
  mcps: TablesInsert<"mcps">[],
  workspace_id: string
) => {
  const { data: createdMcps, error } = await supabase
    .from("mcps")
    .insert(mcps)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  await createMcpWorkspaces(
    createdMcps.map(mcp => ({
      user_id: mcp.user_id,
      mcp_id: mcp.id,
      workspace_id
    }))
  )

  return createdMcps
}

export const createMcpWorkspace = async (item: {
  user_id: string
  mcp_id: string
  workspace_id: string
}) => {
  const { data: createdMcpWorkspace, error } = await supabase
    .from("mcp_workspaces")
    .insert([item])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdMcpWorkspace
}

export const createMcpWorkspaces = async (
  items: { user_id: string; mcp_id: string; workspace_id: string }[]
) => {
  const { data: createdMcpWorkspaces, error } = await supabase
    .from("mcp_workspaces")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdMcpWorkspaces
}

export const updateMcp = async (mcpId: string, mcp: TablesUpdate<"mcps">) => {
  const { data: updatedMcp, error } = await supabase
    .from("mcps")
    .update(mcp)
    .eq("id", mcpId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedMcp
}

export const deleteMcp = async (mcpId: string) => {
  const { error } = await supabase.from("mcps").delete().eq("id", mcpId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteMcpWorkspace = async (
  mcpId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("mcp_workspaces")
    .delete()
    .eq("mcp_id", mcpId)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.message)

  return true
}
