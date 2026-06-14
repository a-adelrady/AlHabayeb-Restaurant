import { useState, useMemo } from "react";

export function usePagination(items = [], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);

  const paginated = useMemo(
    () => items.slice(0, page * pageSize),
    [items, page, pageSize],
  );

  const hasMore = page < totalPages;

  const loadMore = () => setPage((p) => p + 1);

  const reset = () => setPage(1);

  return { paginated, hasMore, loadMore, reset, page, totalPages };
}
