export interface DashboardBootstrapService {
  ensureUserInitialized(userId: string): Promise<void>;
}
