const KEY='repothink-ai-config';
export const AI_PROVIDERS=[{id:'openai',name:'OpenAI',endpoint:'https://api.openai.com/v1/chat/completions'},{id:'anthropic',name:'Anthropic',endpoint:'https://api.anthropic.com/v1/messages'},{id:'gemini',name:'Google Gemini',endpoint:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'},{id:'local',name:'OpenAI-compatible local',endpoint:'http://localhost:11434/v1/chat/completions'}];
export function loadAIConfig(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export function saveAIConfig(config){localStorage.setItem(KEY,JSON.stringify(config));return config}
export function clearAIConfig(){localStorage.removeItem(KEY)}