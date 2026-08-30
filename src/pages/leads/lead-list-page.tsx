import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectPaginatedLeads,
  selectLeadStatusFilter,
  selectLeadSearch,
  selectLeadSort,
  selectLeadPage,
  selectSelectedLeadIds,
  selectFilteredLeads,
  setLeadSearch,
  setLeadStatusFilter,
  setLeadSort,
  setLeadPage,
  toggleLeadSelection,
  toggleSelectAllLeads,
  clearLeadSelection,
  removeManyLeads,
  markLeadConverted,
} from '@/store/slices/lead-slice';
import { addCustomer } from '@/store/slices/customer-slice';
import { selectIsAdmin } from '@/store/slices/auth-slice';
import { addNotification } from '@/store/slices/notification-slice';
import { EMPLOYEES } from '@/services/employees';
import { exportLeadsToCsv } from '@/services/csv-export';
import { LEAD_STATUS_OPTIONS } from '@/schemas/lead';
import { LeadFormModal } from '@/components/leads/lead-form-modal';
import { ConvertLeadDialog } from '@/components/leads/convert-lead-dialog';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  SearchInput,
  ConfirmDialog,
  EmptyState,
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import {
  Plus,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  ArrowRightLeft,
} from 'lucide-react';
import type { Lead, LeadStatus } from '@/types';

const employeeMap = new Map(EMPLOYEES.map((e) => [e.id, e.name]));

type SortField =
  'name' | 'email' | 'company' | 'status' | 'createdAt' | 'assignedEmployeeId';

function SortIcon({
  field,
  sort,
}: {
  field: SortField;
  sort: { field: SortField; dir: 'asc' | 'desc' };
}) {
  if (sort.field !== field) return null;
  return sort.dir === 'asc' ? (
    <ChevronUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ChevronDown className="ml-1 inline h-3 w-3" />
  );
}

const STATUS_BADGE_VARIANT: Record<
  LeadStatus,
  'default' | 'secondary' | 'success' | 'destructive' | 'warning'
> = {
  New: 'default',
  Contacted: 'secondary',
  'Follow-up': 'warning',
  Qualified: 'success',
  Converted: 'success',
  Lost: 'destructive',
};

function LeadListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAdmin = useAppSelector(selectIsAdmin);
  const { items, total, totalPages } = useAppSelector(selectPaginatedLeads);
  const statusFilter = useAppSelector(selectLeadStatusFilter);
  const search = useAppSelector(selectLeadSearch);
  const sort = useAppSelector(selectLeadSort);
  const page = useAppSelector(selectLeadPage);
  const selectedIds = useAppSelector(selectSelectedLeadIds);
  const allFiltered = useAppSelector(selectFilteredLeads);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);

  const handleSort = (field: SortField) => {
    dispatch(
      setLeadSort({
        field,
        dir: sort.field === field && sort.dir === 'asc' ? 'desc' : 'asc',
      })
    );
  };

  const handleBulkDelete = () => {
    dispatch(removeManyLeads(selectedIds));
    dispatch(
      addNotification(
        'Leads deleted',
        `${selectedIds.length} lead(s) removed.`,
        'success'
      )
    );
    dispatch(clearLeadSelection());
    setBulkDeleteOpen(false);
  };

  const handleConvert = (lead: Lead, location: string) => {
    dispatch(markLeadConverted(lead.id));
    dispatch(
      addCustomer({
        id: `cust-${Date.now()}`,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        location,
        status: 'Active',
        assignedEmployeeId: lead.assignedEmployeeId,
        createdAt: new Date().toISOString(),
        notes: [],
      })
    );
    dispatch(
      addNotification(
        'Lead converted',
        `${lead.name} has been added as a customer.`,
        'success'
      )
    );
    setConvertLead(null);
    navigate('/customers');
  };

  const handleExport = () => {
    exportLeadsToCsv(allFiltered);
    dispatch(
      addNotification('Export started', 'CSV download triggered.', 'success')
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {total} lead{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
          {selectedIds.length > 0 && isAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditingLead(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onSearch={(v) => dispatch(setLeadSearch(v))}
              placeholder="Search leads..."
              className="sm:w-72"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                dispatch(setLeadStatusFilter(v as LeadStatus | 'All'))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="All">All Statuses</SelectItem>
                {LEAD_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <EmptyState
              title="No leads found"
              description={
                statusFilter !== 'All'
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding your first lead.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && (
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === items.length &&
                            items.length > 0
                          }
                          onChange={() => dispatch(toggleSelectAllLeads())}
                          className="h-4 w-4 rounded border-input"
                        />
                      </TableHead>
                    )}
                    <TableHead>
                      <button
                        onClick={() => handleSort('name')}
                        className="hover:text-foreground"
                      >
                        Name
                        <SortIcon field="name" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <button
                        onClick={() => handleSort('email')}
                        className="hover:text-foreground"
                      >
                        Email
                        <SortIcon field="email" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <button
                        onClick={() => handleSort('company')}
                        className="hover:text-foreground"
                      >
                        Company
                        <SortIcon field="company" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('status')}
                        className="hover:text-foreground"
                      >
                        Status
                        <SortIcon field="status" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      <button
                        onClick={() => handleSort('assignedEmployeeId')}
                        className="hover:text-foreground"
                      >
                        Employee
                        <SortIcon field="assignedEmployeeId" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="hover:text-foreground"
                      >
                        Created At
                        <SortIcon field="createdAt" sort={sort} />
                      </button>
                    </TableHead>
                    <TableHead className="w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((l) => (
                    <TableRow key={l.id}>
                      {isAdmin && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(l.id)}
                            onChange={() => dispatch(toggleLeadSelection(l.id))}
                            className="h-4 w-4 rounded border-input"
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-foreground">
                        {l.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {l.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {l.company}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANT[l.status]}>
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {employeeMap.get(l.assignedEmployeeId) ?? 'Unassigned'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingLead(l);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {l.status !== 'Converted' && l.status !== 'Lost' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-success hover:text-success"
                              title="Convert to customer"
                              onClick={() => setConvertLead(l)}
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => {
                                setEditingLead(l);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => dispatch(setLeadPage(p))}
          />
        </div>
      )}

      {/* Modals */}
      <LeadFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete lead"
        description={`Are you sure you want to delete "${editingLead?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (editingLead) {
            dispatch(removeManyLeads([editingLead.id]));
            dispatch(
              addNotification(
                'Lead deleted',
                `${editingLead.name} has been removed.`,
                'success'
              )
            );
          }
          setDeleteConfirmOpen(false);
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete leads"
        description={`Are you sure you want to delete ${selectedIds.length} lead(s)? This action cannot be undone.`}
        confirmLabel="Delete all"
        variant="destructive"
        onConfirm={handleBulkDelete}
      />

      <ConvertLeadDialog
        lead={convertLead}
        onOpenChange={(open) => {
          if (!open) setConvertLead(null);
        }}
        onConvert={handleConvert}
      />
    </div>
  );
}

export default LeadListPage;
