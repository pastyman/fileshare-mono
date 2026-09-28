import { NextRouter } from "next/router"
import { Pagination, Sorting, Filter } from "./index"

export function useTableNav(
  router: NextRouter,
  initialPageSize: number,
  basePath: string
) {
  const handleSortChange = (sort: Sorting) => {
    console.log("SORT CHANGE")

    router.replace({
      pathname: basePath,
      query: {
        ...router.query,
        pageIndex: 0,
        sortField: sort.id,
        sortDir: sort.dir,
      },
    })
  }

  const handlePaginationChange = (pagination: Pagination) => {
    console.log("pagination change")

    router.replace({
      pathname: basePath,
      query: {
        ...router.query,
        ...pagination,
      },
    })
  }

  const handleFilterChange = (filters: Filter[]) => {
    console.log("filter change")
    router.replace({
      pathname: basePath,
      query: {
        ...router.query,
        pageIndex: 0,
        filters: JSON.stringify(filters),
      },
    })
  }

  const sortField = router.query["sortField"]
    ? router.query["sortField"].toString()
    : ""
  const sortDir = router.query["sortDir"]
    ? router.query["sortDir"].toString()
    : ""
  const pageIndex = router.query["pageIndex"]
    ? parseInt(router.query["pageIndex"].toString())
    : 0
  const pageSize = router.query["pageSize"]
    ? parseInt(router.query["pageSize"].toString())
    : initialPageSize
  const filters = router.query["filters"]
    ? (JSON.parse(router.query["filters"].toString()) as Filter[])
    : []

  return {
    handleSortChange,
    handlePaginationChange,
    handleFilterChange,
    sortField,
    sortDir,
    pageIndex,
    pageSize,
    filters,
  }
}
