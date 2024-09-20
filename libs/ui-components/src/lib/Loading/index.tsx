import Grid from "@mui/material/Grid"
import { LoadingCard } from "./LoadingCard"
import Skeleton from "@mui/material/Skeleton"
export * from "./Spinner"

export const LoadingMini = ({ sx }: { sx: object }) => {
  return <Skeleton animation="wave" sx={sx} />
}

export const Loading = ({
  isLoading,
  error,
}: {
  isLoading: boolean
  error: boolean
}) => {
  return (
    <>
      {isLoading && (
        <>
          <Grid item xs={12} md={12} p={1}>
            <LoadingCard />
          </Grid>
          <Grid item xs={12} md={12} p={1} mt={1}>
            <LoadingCard />
          </Grid>
        </>
      )}
      {!isLoading && error && "An error has occurred"}
    </>
  )
}
