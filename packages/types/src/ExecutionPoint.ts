
export interface ExecutionPoint {
  name: string;
  selector?: string;
  execute: (element: Element) => void;
}
