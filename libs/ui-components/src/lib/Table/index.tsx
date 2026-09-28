import { useMemo, useState, useEffect } from "react"
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table"
import { IconButton, Tooltip } from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import { useTableNav } from "./useTableNav"
export { useTableNav }

export type Pagination = {
  pageIndex: number
  pageSize: number
}

export type Sorting = {
  id: string
  dir: "desc" | "asc" | ""
}

export type Filter = {
  id: string
  value: string | unknown
}

export const Table = ({ ...rest }) => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    columns,
    sortDir,
    sortField,
    onSortChange,
    rowCount,
    pageIndex,
    pageSize,
    onPaginationChange,
    onRefetch,
    onFilterChange,
    filters,
    onRowClick,
    ...theRest
  } = rest

  //pagination
  /////////////////////////////////////////////////////////////////
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex,
    pageSize,
  })
  useEffect(() => {
    console.log("pagination", pagination)
    !isFetching && onPaginationChange(pagination)
  }, [pagination])

  //sorting
  /////////////////////////////////////////////////////////////////
  const [sorting, setSorting] = useState<MRT_SortingState>(
    sortField !== "" && sortDir !== ""
      ? [{ id: sortField, desc: sortDir === "desc" }]
      : []
  )
  useEffect(() => {
    if (sorting.length > 0) {
      !isFetching &&
        onSortChange({
          id: sorting[0].id,
          dir: sorting[0].desc ? "desc" : "asc",
        })
    } else {
      !isFetching &&
        onSortChange({
          id: "",
          dir: "",
        })
    }
  }, [sorting])

  //filtering
  /////////////////////////////////////////////////////////////////
  const [columnFilters, setColumnFilters] =
    useState<MRT_ColumnFiltersState>(filters)
  useEffect(() => {
    !isFetching && onFilterChange(columnFilters)
  }, [columnFilters])

  const columnsDef = useMemo<MRT_ColumnDef<any>[]>(() => columns, [])

  return (
    <MaterialReactTable
      enableGlobalFilter={false}
      rowCount={rowCount}
      columns={columnsDef}
      data={data}
      manualFiltering
      manualPagination
      manualSorting
      muiToolbarAlertBannerProps={
        isError
          ? {
              color: "error",
              children: "Error loading data",
            }
          : undefined
      }
      onColumnFiltersChange={setColumnFilters}
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      renderTopToolbarCustomActions={() => (
        <Tooltip arrow title="Refresh Data">
          <IconButton onClick={() => onRefetch && onRefetch()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => {
          onRowClick && onRowClick(row.original)
        },
        sx: onRowClick ? { cursor: "pointer" } : {},
      })}
      state={{
        columnFilters,
        isLoading,
        pagination: { pageIndex, pageSize },
        showAlertBanner: isError,
        showProgressBars: isFetching,
        sorting,
      }}
      initialState={{
        columnFilters,
        isLoading,
        pagination: { pageIndex, pageSize },
        showAlertBanner: isError,
        showProgressBars: isFetching,
        sorting,
      }}
      {...theRest}
    />
  )
}
