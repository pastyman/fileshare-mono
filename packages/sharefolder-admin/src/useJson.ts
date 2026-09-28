import { useCallback, useEffect, useState } from "react"

/** Fetches JSON from an admin API route, optionally polling. */
export function useJson<T>(url: string, refreshMs?: number) {
  const [data, setData] = useState<T | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [isError, setIsError] = useState(false)

  const refetch = useCallback(async () => {
    setIsFetching(true)
    try {
      const response = await fetch(url)
      if (response.status === 401) {
        window.location.href = "/login"
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setData(await response.json())
      setIsError(false)
    } catch {
      setIsError(true)
    } finally {
      setIsFetching(false)
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    refetch()
    if (!refreshMs) return
    const timer = setInterval(refetch, refreshMs)
    return () => clearInterval(timer)
  }, [refetch, refreshMs])

  return { data, isLoading, isFetching, isError, refetch }
}
