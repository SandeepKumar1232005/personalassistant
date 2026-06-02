export type ProviderType = 'gemini'

export type AnalysisMode =
  | 'explain'
  | 'summarize'
  | 'ocr'
  | 'code-analysis'
  | 'error-debug'
  | 'ui-understanding'
  | 'table-analysis'
  | 'chart-analysis'
  | 'diagram-analysis'
  | 'translate'
  | 'qa'

export type AppMode =
  | 'quick-explain'
  | 'developer'
  | 'student'
  | 'research'
  | 'accessibility'

export interface AnalyzeParams {
  imageBase64: string
  mode: AnalysisMode
  prompt?: string
  appMode?: AppMode
}

export interface ChatParams {
  messages: ChatMessage[]
  imageBase64?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export interface AIProvider {
  name: string
  type: ProviderType
  analyzeImage(params: AnalyzeParams): AsyncGenerator<string, void, unknown>
  chat(params: ChatParams): AsyncGenerator<string, void, unknown>
  validateApiKey(key: string): Promise<boolean>
}

export interface ProviderConfig {
  type: ProviderType
  apiKey: string
  model: string
  endpoint?: string
  customHeaders?: Record<string, string>
}

export interface StreamChunk {
  content: string
  done: boolean
}

export const ANALYSIS_MODE_LABELS: Record<AnalysisMode, string> = {
  explain: 'Explain',
  summarize: 'Summarize',
  ocr: 'Extract Text (OCR)',
  'code-analysis': 'Code Analysis',
  'error-debug': 'Debug Error',
  'ui-understanding': 'UI Analysis',
  'table-analysis': 'Table Analysis',
  'chart-analysis': 'Chart Analysis',
  'diagram-analysis': 'Diagram Analysis',
  translate: 'Translate',
  qa: 'Ask Question'
}

export const APP_MODE_LABELS: Record<AppMode, string> = {
  'quick-explain': 'Quick Explain',
  developer: 'Developer',
  student: 'Student',
  research: 'Research',
  accessibility: 'Accessibility'
}

export const APP_MODE_DESCRIPTIONS: Record<AppMode, string> = {
  'quick-explain': 'Brief, clear explanations of any content',
  developer: 'Code-focused analysis with bug detection and improvements',
  student: 'Educational explanations with examples and analogies',
  research: 'Detailed technical analysis with data insights',
  accessibility: 'Image-to-text descriptions for accessibility'
}

export const APP_MODE_ICONS: Record<AppMode, string> = {
  'quick-explain': '⚡',
  developer: '💻',
  student: '📚',
  research: '🔬',
  accessibility: '♿'
}
