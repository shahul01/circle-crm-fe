import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { usePersistSubmit } from '@/hooks/use-persist-submit';
import {
  selectCustomerById,
  addNoteToCustomer,
} from '@/store/slices/customer-slice';
import { selectTasksByCustomerId } from '@/store/slices/task-slice';
import { selectActivitiesByEntity } from '@/store/slices/activity-slice';
import { EMPLOYEES } from '@/services/employees';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
  Spinner,
} from '@/components/ui';
import {
  ArrowLeft,
  Plus,
  StickyNote,
  CheckSquare,
  Activity,
} from 'lucide-react';

const employeeMap = new Map(EMPLOYEES.map((e) => [e.id, e]));

function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const customer = useAppSelector((s) => selectCustomerById(s, id ?? ''));
  const tasks = useAppSelector((s) => selectTasksByCustomerId(id ?? '')(s));
  const activities = useAppSelector((s) =>
    selectActivitiesByEntity(id ?? '')(s)
  );

  const [noteText, setNoteText] = useState('');
  const { saving, run } = usePersistSubmit();

  if (!customer) {
    return (
      <div className="space-y-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Link>
        <EmptyState
          title="Customer not found"
          description="This customer may have been deleted."
        />
      </div>
    );
  }

  const employee = employeeMap.get(customer.assignedEmployeeId);

  const handleAddNote = () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    run(() => {
      dispatch(
        addNoteToCustomer({ customerId: customer.id, content: trimmed })
      );
    });
    setNoteText('');
  };

  return (
    <div className="space-y-4">
      <Link
        to="/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {customer.name}
          </h2>
          <p className="text-sm text-muted-foreground">{customer.company}</p>
        </div>
        <Badge
          variant={customer.status === 'Active' ? 'success' : 'secondary'}
          className="w-fit"
        >
          {customer.status}
        </Badge>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({customer.notes.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="activity">
            Activity ({activities.length})
          </TabsTrigger>
        </TabsList>

        {/* Info */}
        <TabsContent value="info">
          <Card>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {customer.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {customer.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Company
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {customer.company}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {customer.location}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Assigned Employee
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {employee
                      ? `${employee.name} — ${employee.role}`
                      : 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="h-4 w-4 text-primary" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a note..."
                  className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || saving}
                >
                  {saving ? (
                    <Spinner size="sm" className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Plus className="mr-1 h-3.5 w-3.5" />
                  )}
                  {saving ? 'Saving' : 'Add'}
                </Button>
              </div>

              {customer.notes.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No notes yet
                </p>
              ) : (
                <div className="space-y-2">
                  {[...customer.notes].reverse().map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <p className="text-sm text-foreground">{n.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckSquare className="h-4 w-4 text-warning" />
                Related Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No tasks linked to this customer
                </p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            t.priority === 'High'
                              ? 'destructive'
                              : t.priority === 'Medium'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {t.priority}
                        </Badge>
                        <Badge variant="outline">{t.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-accent" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No activity recorded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Activity className="h-3 w-3 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{a.action}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomerDetailPage;
