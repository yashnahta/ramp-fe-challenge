import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)

  //Bug 6 : Part 1 - Using isAllEmployFilter value to keep track if the transaction list if for employee or for all employees
  const [isAllEmployFilter, setAllEmployFilter] = useState(true);

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  //Bug 6 : Part 2 - Checking if nextPage is null or not. If Null then nextTransaction will be set to null which restrict View More button to display
  const nextTransactions = useMemo(
    () => paginatedTransactions?.nextPage ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)

    //Bug 7 : transactionsByEmployeeUtils.invalidateData() is setting transaction data to null hence approval value changes everytime when transaction data is rendered/fetched
    //transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    //Bug 5 : Setting isLoading to false right after employee details fetched 
    setIsLoading(false)
    if (paginatedTransactions?.nextPage === null) {
      setAllEmployFilter(false)
    } else {
      await paginatedTransactionsUtils.fetchAll()
    }


    //setIsLoading(false) //Bug 5 : Commenting previous statement
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            //Bug 3 : After Selecting All Employees option useEmployees custom hook should be used but earlier useTransactionsByEmployee was used hence causing error
            if (newValue.firstName === "All" && newValue.lastName === "Employees") {
              await loadAllTransactions();
              paginatedTransactionsUtils.invalidateData()
              console.log("Page " + paginatedTransactions?.nextPage);
              if (paginatedTransactions?.nextPage) {
                console.log("Page " + paginatedTransactions.nextPage.toString());
                setAllEmployFilter(true);
              }
              setAllEmployFilter(true);
            }

          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />
          {/*Bug 6 Part 1 &  Part 2 - isAllEmployFilter, nextTransaction*/}
          {transactions !== null && isAllEmployFilter && nextTransactions !== null && (
            <button
              className="RampButton"
              disabled={transactionsByEmployeeUtils.loading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
