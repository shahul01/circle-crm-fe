import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectPaginatedCustomers,
  selectCustomerStatusFilter,
  selectCustomerSearch,
  selectCustomerSort,
  selectCustomerPage,
  selectSelectedCustomerIds,
  setCustomerSearch,
  setCustomerStatusFilter,
  setCustomerSort,
  setCustomerPage,
  toggleCustomerSelection,
  toggleSelectAllCustomers,
  clearCustomerSelection,
  removeManyCustomers,
  selectFilteredCustomers,
} from '@/store/slices/customer-slice';
import { selectIsAdmin } from '@/store/slices/auth-slice';
import { addNotification } from '@/store/slices/notification-slice';
import { EMPLOYEES } from '@/services/employees';
import { exportCustomersToCsv } from '@/services/csv-export';
import { CustomerFormModal } from '@/components/customers/customer-form-modal';
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
  Eye,
} from 'lucide-react';
import type { Customer, CustomerStatus } from '@/types';

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

function CustomerListPage() {
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);
  const { items, total, totalPages } = useAppSelector(selectPaginatedCustomers);
  const statusFilter = useAppSelector(selectCustomerStatusFilter);
  const search = useAppSelector(selectCustomerSearch);
  const sort = useAppSelector(selectCustomerSort);
  const page = useAppSelector(selectCustomerPage);
  const selectedIds = useAppSelector(selectSelectedCustomerIds);
  const allFiltered = useAppSelector(selectFilteredCustomers);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleSort = (field: SortField) => {
    dispatch(
      setCustomerSort({
        field,
        dir: sort.field === field && sort.dir === 'asc' ? 'desc' : 'asc',
      })
    );
  };

  const handleBulkDelete = () => {
    dispatch(removeManyCustomers(selectedIds));
    dispatch(
      addNotification(
        'Customers deleted',
        `${selectedIds.length} customer(s) removed.`,
        'success'
      )
    );
    dispatch(clearCustomerSelection());
    setBulkDeleteOpen(false);
  };

  const handleExport = () => {
    exportCustomersToCsv(allFiltered);
    dispatch(
      addNotification('Export started', 'CSV download triggered.', 'success')
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customers</h2>
          <p className="text-sm text-muted-foreground">
            {total} customer{total !== 1 ? 's' : ''} total
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
              setEditingCustomer(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onSearch={(v) => dispatch(setCustomerSearch(v))}
              placeholder="Search customers..."
              className="sm:w-72"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                dispatch(setCustomerStatusFilter(v as CustomerStatus | 'All'))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
              title="No customers found"
              description={
                statusFilter !== 'All'
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding your first customer.'
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
                          onChange={() => dispatch(toggleSelectAllCustomers())}
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
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((c) => (
                    <TableRow key={c.id}>
                      {isAdmin && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() =>
                              dispatch(toggleCustomerSelection(c.id))
                            }
                            className="h-4 w-4 rounded border-input"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Link
                          to={`/customers/${c.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {c.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {c.company}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === 'Active' ? 'success' : 'secondary'
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground">
                        {employeeMap.get(c.assignedEmployeeId) ?? 'Unassigned'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link
                            to={`/customers/${c.id}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground hover:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingCustomer(c);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => {
                                setEditingCustomer(c);
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
            onPageChange={(p) => dispatch(setCustomerPage(p))}
          />
        </div>
      )}

      {/* Modals */}
      <CustomerFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete customer"
        description={`Are you sure you want to delete "${editingCustomer?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (editingCustomer) {
            dispatch(removeManyCustomers([editingCustomer.id]));
            dispatch(
              addNotification(
                'Customer deleted',
                `${editingCustomer.name} has been removed.`,
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
        title="Delete customers"
        description={`Are you sure you want to delete ${selectedIds.length} customer(s)? This action cannot be undone.`}
        confirmLabel="Delete all"
        variant="destructive"
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}

export default CustomerListPage;
