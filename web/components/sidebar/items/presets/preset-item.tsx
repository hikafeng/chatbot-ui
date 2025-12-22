import { ModelIcon } from "@/components/models/model-icon"
import { ChatSettingsForm } from "@/components/ui/chat-settings-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PRESET_NAME_MAX } from "@/db/limits"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import { useContext, useEffect, useRef } from "react"
import { ChatbotUIContext } from "@/context/context"
import { ChatMessage, ChatPayload, LLMID, ModelProvider } from "@/types"
import { LLM } from "@/types"

interface PresetItemProps {
  preset: Tables<"presets">
}

export const PresetItem: FC<PresetItemProps> = ({ preset }) => {
  const [name, setName] = useState(preset.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(preset.description)
  const [presetChatSettings, setPresetChatSettings] = useState({
    model: preset.model,
    prompt: preset.prompt,
    temperature: preset.temperature,
    contextLength: preset.context_length,
    includeProfileContext: preset.include_profile_context,
    includeWorkspaceInstructions: preset.include_workspace_instructions
  })
  const {
    userInput,
    chatFiles,
    setUserInput,
    setNewMessageImages,
    profile,
    setIsGenerating,
    setChatMessages,
    setFirstTokenReceived,
    selectedChat,
    selectedWorkspace,
    setSelectedChat,
    setChats,
    setSelectedTools,
    setSelectedMcps,
    availableLocalModels,
    availableOpenRouterModels,
    availableDeepSeekModels,
    abortController,
    setAbortController,
    chatSettings,
    newMessageImages,
    selectedAssistant,
    chatMessages,
    chatImages,
    setChatImages,
    setChatFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    newMessageFiles,
    chatFileItems,
    setChatFileItems,
    setToolInUse,
    useRetrieval,
    sourceCount,
    setIsPromptPickerOpen,
    setIsFilePickerOpen,
    selectedTools,
    selectedPreset,
    setChatSettings,
    models,
    isPromptPickerOpen,
    isFilePickerOpen,
    isToolPickerOpen
  } = useContext(ChatbotUIContext)
  // const modelDetails = LLM_LIST.find(model => model.modelId === preset.model)
  const MODEL_DATA = [
    ...models.map(model => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...LLM_LIST,
    ...availableLocalModels,
    ...availableDeepSeekModels,
    ...availableOpenRouterModels
  ].find(llm => llm.modelId === preset.model) as LLM
  return (
    <SidebarItem
      item={preset}
      isTyping={isTyping}
      contentType="presets"
      icon={
        <ModelIcon
          provider={MODEL_DATA?.provider || "custom"}
          height={30}
          width={30}
        />
      }
      updateState={{
        name,
        description,
        include_profile_context: presetChatSettings.includeProfileContext,
        include_workspace_instructions:
          presetChatSettings.includeWorkspaceInstructions,
        context_length: presetChatSettings.contextLength,
        model: presetChatSettings.model,
        prompt: presetChatSettings.prompt,
        temperature: presetChatSettings.temperature
      }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Preset name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={PRESET_NAME_MAX}
            />
          </div>

          <ChatSettingsForm
            chatSettings={presetChatSettings as any}
            onChangeChatSettings={setPresetChatSettings}
            useAdvancedDropdown={true}
          />
        </>
      )}
    />
  )
}
