import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert } from "@/supabase/types"

export const getAssistantMcpsByAssistantId = async (assistantId: string) => {
  const { data: assistantMcps, error } = await supabase
    .from("assistants")
    .select(
      `
        id, 
        name, 
        mcps (*)
      `
    )
    .eq("id", assistantId)
    .single()

  if (!assistantMcps) {
    throw new Error(error.message)
  }

  return assistantMcps
}

export const createAssistantMcp = async (
  assistantMcp: TablesInsert<"assistant_mcps">
) => {
  const { data: createdAssistantMcp, error } = await supabase
    .from("assistant_mcps")
    .insert(assistantMcp)
    .select("*")

  if (!createdAssistantMcp) {
    throw new Error(error.message)
  }

  return createdAssistantMcp
}

export const createAssistantMcps = async (
  assistantMcps: TablesInsert<"assistant_mcps">[]
) => {
  const { data: createdAssistantMcps, error } = await supabase
    .from("assistant_mcps")
    .insert(assistantMcps)
    .select("*")

  if (!createdAssistantMcps) {
    throw new Error(error.message)
  }

  return createdAssistantMcps
}

export const deleteAssistantMcp = async (
  assistantId: string,
  mcpId: string
) => {
  const { error } = await supabase
    .from("assistant_mcps")
    .delete()
    .eq("assistant_id", assistantId)
    .eq("mcp_id", mcpId)

  if (error) throw new Error(error.message)

  return true
}
