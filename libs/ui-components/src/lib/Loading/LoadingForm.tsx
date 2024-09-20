import Skeleton from "@mui/material/Skeleton"

export const LoadingForm = () => {
  return (
    <Skeleton
      animation="wave"
      sx={{
        height: "80px",
        borderRadius: "8px",
        marginTop: "-14px",
        marginBottom: "-14px",
      }}
    />
  )
}
