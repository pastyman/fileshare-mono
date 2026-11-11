import React from "react"
import { useRouter } from "next/router"
import { Container, DividerThin, Spacer, Table, Txt, useTableNav } from "ui-components"
import { useJson } from "../src/useJson"
import type { DailyRow } from "../src/stats"

const column = (header: string, accessorKey: keyof DailyRow) => ({
  accessorKey,
  header,
  enableColumnFilter: false,
  enableSorting: false,
})

const derived = (header: string, value: (row: DailyRow) => number | string) => ({
  id: header,
  header,
  accessorFn: value,
  enableColumnFilter: false,
  enableSorting: false,
})

const Daily = () => {
  const router = useRouter()
  const { handleSortChange, handlePaginationChange, handleFilterChange, sortField, sortDir, pageIndex, pageSize, filters } =
    useTableNav(router, 30, "/daily")

  const { data, isError, isFetching, isLoading, refetch } = useJson<{ data: DailyRow[]; rowCount: number }>(
    `/api/daily?pageIndex=${pageIndex}&pageSize=${pageSize}`
  )

  return (
    <Container uc="main">
      <Txt uc="h1">Daily stats</Txt>
      <Spacer uc="small" />
      <DividerThin />
      <Spacer uc="medium" />

      <Table
        data={data?.data ?? []}
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading}
        onRefetch={() => refetch()}
        rowCount={data?.rowCount ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        sortDir={sortDir}
        sortField={sortField}
        onSortChange={handleSortChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        enableColumnActions={false}
        columns={[
          column("Day (UTC)", "day"),
          column("Successful", "connections"),
          derived("Failed to connect", (row) => Math.max(0, row.pinsMatched - row.connections)),
          derived("Success rate", (row) =>
            row.pinsMatched > 0 ? `${Math.round((row.connections / row.pinsMatched) * 100)}%` : "–"
          ),
          column("PINs created", "pinsCreated"),
          column("PINs matched", "pinsMatched"),
          column("Wrong PINs", "pinsIncorrect"),
          column("ICE lookups", "iceRequests"),
        ]}
      />
    </Container>
  )
}

export default Daily
