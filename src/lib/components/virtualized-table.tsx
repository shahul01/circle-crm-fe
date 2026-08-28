import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/lib/components';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    className?: string;
    render: (item: T) => React.ReactNode;
  }[];
  rowHeight?: number;
  maxHeight?: number;
  onRowClick?: (item: T) => void;
}

function VirtualizedTable<T extends { id: string }>({
  data,
  columns,
  rowHeight = 48,
  maxHeight = 500,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="overflow-auto" style={{ maxHeight }}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {virtualizer.getVirtualItems().length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No results
              </TableCell>
            </TableRow>
          ) : (
            <>
              {virtualizer.getVirtualItems()[0]?.start > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{ height: virtualizer.getVirtualItems()[0]?.start }}
                    className="p-0"
                  />
                </TableRow>
              )}
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = data[virtualRow.index];
                return (
                  <TableRow
                    key={item.id}
                    ref={(node) => virtualizer.measureElement(node)}
                    data-index={virtualRow.index}
                    onClick={() => onRowClick?.(item)}
                    className={
                      onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''
                    }
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {virtualizer.getVirtualItems().at(-1) && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    style={{
                      height:
                        virtualizer.getTotalSize() -
                        (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                    }}
                    className="p-0"
                  />
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export { VirtualizedTable };
