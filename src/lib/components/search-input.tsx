import { useState, useEffect, type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  onSearch: (value: string) => void;
  debounceMs?: number;
}

function SearchInput({
  onSearch,
  debounceMs = 300,
  className,
  ...props
}: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [value, debounceMs, onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
        {...props}
      />
    </div>
  );
}

export { SearchInput };
