import { useEffect, useState } from "react";

export const debouncedSearchQuery = (query: string, delay: number) => {
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);

  return debouncedQuery;
};
