// types/hono.d.ts
import 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    user: any;
  }
}
