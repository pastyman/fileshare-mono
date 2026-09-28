import React from "react"
import { useRouter } from "next/router"
import { Container, DividerThin, Spacer, Table, Txt, useTableNav } from "ui-components"
import { useJson } from "../src/useJson"
import type { DailyRow } from "../src/stats"

const counter = (accessorKey: keyof DailyRow, header: string) => ({
  accessorKey,
  header,
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
          counter("day", "Day (UTC)"),
          counter("activeInstances", "Active apps"),
          counter("newInstances", "New installs"),
          counter("connectRequests", "Links opened"),
          counter("hostRegistrations", "Host handshakes"),
          counter("iceRequests", "ICE lookups"),
        ]}
      />
    </Container>
  )
}

export default Daily
