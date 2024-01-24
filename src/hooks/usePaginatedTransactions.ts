import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {

      if (response === null || previousResponse === null) {
        return response
      }

      //Bug 4 : The previous transaction is getting override because every time transaction fetched new list replaces old one
      //To fix this we can sent merge list of old Transactions and new Transactions
      const mergedData = [...(previousResponse?.data ?? []), ...response.data];


      //return { data: response.data, nextPage: response.nextPage }
      return { data: mergedData, nextPage: response.nextPage }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
