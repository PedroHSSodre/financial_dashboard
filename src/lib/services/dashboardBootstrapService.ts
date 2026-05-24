import type { DashboardBootstrapService } from "@/core/application/ports/dashboardBootstrapService";
import { seedFirstAccess } from "@/lib/db/seedFirstAccess";

export class DexieDashboardBootstrapService implements DashboardBootstrapService {
  async ensureUserInitialized(userId: string): Promise<void> {
    await seedFirstAccess(userId);
  }
}
