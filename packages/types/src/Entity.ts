
export interface Entity extends Record<string, unknown> {
  id: string;
}

export interface Reference extends Record<string, unknown> {
  id: string;
}

export type EntityArray<X extends Entity|Reference> = ObjectArray<X>

export type ObjectArray<X> = Record<string, X>