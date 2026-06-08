export interface SSEEvent {
  id?: string;
  event?: string;
  data: string;
}

export async function* parseSSE(response: Response): AsyncGenerator<SSEEvent> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }
  
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent: Partial<SSEEvent> = {};
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // 按行分割
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // 空行表示事件结束
        if (trimmed === '') {
          if (currentEvent.data !== undefined) {
            yield currentEvent as SSEEvent;
          }
          currentEvent = {};
          continue;
        }
        
        // 解析字段
        if (trimmed.startsWith('id:')) {
          currentEvent.id = trimmed.slice(3).trim();
        } else if (trimmed.startsWith('event:')) {
          currentEvent.event = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('data:')) {
          const data = trimmed.slice(5).trim();
          if (currentEvent.data) {
            currentEvent.data += '\n' + data;
          } else {
            currentEvent.data = data;
          }
        } else if (trimmed.startsWith(':')) {
          // 注释，忽略
        }
      }
    }
    
    // 处理最后的事件
    if (currentEvent.data !== undefined) {
      yield currentEvent as SSEEvent;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function collectSSE<T = any>(response: Response): Promise<T[]> {
  const events: T[] = [];
  
  for await (const event of parseSSE(response)) {
    if (event.data === '[DONE]') {
      break;
    }
    
    try {
      const parsed = JSON.parse(event.data);
      events.push(parsed);
    } catch {
      // 忽略解析错误
    }
  }
  
  return events;
}
