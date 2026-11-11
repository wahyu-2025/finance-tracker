import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TablePaginationProps {
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sizes?: number[];
  sizesLabel?: string;
  sizesDescription?: string;
  sizesSkeleton?: ReactNode;
  moreLimit?: number;
  info?: string;
  infoSkeleton?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function TablePagination({
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
  sizes = [5, 10, 25, 50, 100],
  sizesLabel = 'Rows per page',
  sizesDescription,
  sizesSkeleton = <Skeleton className="h-8 w-44" />,
  moreLimit = 5,
  info = '{from} - {to} of {count}',
  infoSkeleton = <Skeleton className="h-8 w-60" />,
  isLoading = false,
  className,
}: TablePaginationProps) {
  const btnBaseClasses = 'size-7 p-0 text-sm';
  const btnArrowClasses = btnBaseClasses + ' rtl:transform rtl:rotate-180';

  const pageCount = Math.max(1, Math.ceil(totalCount / limit));
  const from = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalCount);

  // Replace placeholders in paginationInfo
  const paginationInfo = info
    ? info
        .replace('{from}', from.toString())
        .replace('{to}', to.toString())
        .replace('{count}', totalCount.toString())
    : `${from} - ${to} of ${totalCount}`;

  // Determine current group for page buttons
  const currentGroupStart =
    Math.floor((page - 1) / moreLimit) * moreLimit + 1;
  const currentGroupEnd = Math.min(currentGroupStart + moreLimit - 1, pageCount);

  const renderPageButtons = () => {
    const buttons = [];
    for (let i = currentGroupStart; i <= currentGroupEnd; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          mode="icon"
          variant="ghost"
          className={cn(btnBaseClasses, 'text-muted-foreground', {
            'bg-accent text-accent-foreground font-semibold': page === i,
          })}
          onClick={() => {
            if (page !== i) {
              onPageChange(i);
            }
          }}
          disabled={isLoading}
        >
          {i}
        </Button>,
      );
    }
    return buttons;
  };

  const renderEllipsisPrevButton = () => {
    if (currentGroupStart > 1) {
      return (
        <Button
          size="sm"
          mode="icon"
          className={btnBaseClasses}
          variant="ghost"
          onClick={() => onPageChange(currentGroupStart - 1)}
          disabled={isLoading}
        >
          ...
        </Button>
      );
    }
    return null;
  };

  const renderEllipsisNextButton = () => {
    if (currentGroupEnd < pageCount) {
      return (
        <Button
          className={btnBaseClasses}
          variant="ghost"
          size="sm"
          mode="icon"
          onClick={() => onPageChange(currentGroupEnd + 1)}
          disabled={isLoading}
        >
          ...
        </Button>
      );
    }
    return null;
  };

  return (
    <div
      data-slot="table-pagination"
      className={cn('w-full py-2.5 sm:py-3', className)}
    >
      {/* ================= Mobile View (< sm) ================= */}
      <div className="flex sm:hidden flex-col gap-2.5 w-full">
        {isLoading ? (
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ) : (
          <>
            {/* Top row: Touch-friendly Prev / Page Indicator / Next */}
            {pageCount > 1 && (
              <div className="flex items-center justify-between w-full gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeftIcon className="size-3.5 mr-1" />
                  Prev
                </Button>

                <span className="text-xs font-medium text-muted-foreground">
                  Page <strong className="text-foreground">{page}</strong> of{' '}
                  <strong className="text-foreground">{pageCount}</strong>
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= pageCount || isLoading}
                >
                  Next
                  <ChevronRightIcon className="size-3.5 ml-1" />
                </Button>
              </div>
            )}

            {/* Bottom row: Rows per page selector + Total range info */}
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-0.5">
              <div className="flex items-center gap-1.5">
                <span>Rows:</span>
                {onLimitChange && (
                  <Select
                    value={`${limit}`}
                    indicatorPosition="right"
                    onValueChange={(value) => {
                      const newLimit = Number(value);
                      onLimitChange(newLimit);
                      onPageChange(1);
                    }}
                  >
                    <SelectTrigger className="h-7 w-fit min-w-[56px] text-xs px-2" size="sm">
                      <SelectValue placeholder={`${limit}`} />
                    </SelectTrigger>
                    <SelectContent side="top" className="min-w-[56px]">
                      {sizes.map((size: number) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>{paginationInfo}</div>
            </div>
          </>
        )}
      </div>

      {/* ================= Desktop View (>= sm) ================= */}
      <div className="hidden sm:flex flex-row justify-between items-center gap-2.5 w-full">
        <div className="flex flex-wrap items-center space-x-2.5">
          {isLoading ? (
            sizesSkeleton
          ) : (
            <>
              {sizesLabel && (
                <div className="text-sm text-muted-foreground">{sizesLabel}</div>
              )}
              {onLimitChange && (
                <Select
                  value={`${limit}`}
                  indicatorPosition="right"
                  onValueChange={(value) => {
                    const newLimit = Number(value);
                    onLimitChange(newLimit);
                    onPageChange(1);
                  }}
                >
                  <SelectTrigger className="w-fit" size="sm">
                    <SelectValue placeholder={`${limit}`} />
                  </SelectTrigger>
                  <SelectContent side="top" className="min-w-[50px]">
                    {sizes.map((size: number) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {sizesDescription && (
                <div className="text-sm text-muted-foreground">
                  {sizesDescription}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-row justify-end items-center gap-2.5">
          {isLoading ? (
            infoSkeleton
          ) : (
            <>
              <div className="text-sm text-muted-foreground text-nowrap">
                {paginationInfo}
              </div>
              {pageCount > 1 && (
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    mode="icon"
                    variant="ghost"
                    className={btnArrowClasses}
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1 || isLoading}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon className="size-4" />
                  </Button>

                  {renderEllipsisPrevButton()}

                  {renderPageButtons()}

                  {renderEllipsisNextButton()}

                  <Button
                    size="sm"
                    mode="icon"
                    variant="ghost"
                    className={btnArrowClasses}
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= pageCount || isLoading}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
