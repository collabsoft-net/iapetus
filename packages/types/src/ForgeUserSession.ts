

export interface ForgeUserSession {
  id: string,
  instanceId: string,
  appId: string,
  installationId: string,
  cloudId?: string,
  appSystemToken?: string,
  appUserToken?: string
}