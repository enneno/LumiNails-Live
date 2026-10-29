import { AdminLogsTab } from "./components/admin-logs-tab";

export function LogsPanel({ data, loading, onRefresh }: any) {
  return <AdminLogsTab events={data.errorLogs || []} loading={loading} error={data.logError || null} onRefresh={onRefresh} />;
}
