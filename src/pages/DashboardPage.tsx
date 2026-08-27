import { useAppSelector } from '@/store/hooks';
import {
  selectTotalCustomers,
  selectAllCustomers,
} from '@/store/slices/customer-slice';
import {
  selectTotalLeads,
  selectConvertedLeads,
} from '@/store/slices/lead-slice';
import {
  selectPendingTasks,
  selectCompletedTasks,
} from '@/store/slices/task-slice';
import { selectRecentActivities } from '@/store/slices/activity-slice';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@/lib/components';
import {
  Users,
  Target,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  UserPlus,
  TrendingUp,
  Activity,
} from 'lucide-react';

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${color}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const totalCustomers = useAppSelector(selectTotalCustomers);
  const totalLeads = useAppSelector(selectTotalLeads);
  const convertedLeads = useAppSelector(selectConvertedLeads);
  const pendingTasks = useAppSelector(selectPendingTasks);
  const completedTasks = useAppSelector(selectCompletedTasks);
  const recentCustomers = useAppSelector((s) =>
    selectAllCustomers(s).slice(-5).reverse()
  );
  const recentActivities = useAppSelector(selectRecentActivities(8));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of your CRM data
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          color="bg-primary"
        />
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={Target}
          color="bg-secondary"
        />
        <StatCard
          title="Converted"
          value={convertedLeads}
          icon={ArrowRightLeft}
          color="bg-success"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={Clock}
          color="bg-warning"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle2}
          color="bg-accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-primary" />
              Recent Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCustomers.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No customers yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentCustomers.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.company}
                      </p>
                    </div>
                    <Badge
                      variant={c.status === 'Active' ? 'success' : 'secondary'}
                    >
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-accent" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No activities yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{a.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.entityName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
