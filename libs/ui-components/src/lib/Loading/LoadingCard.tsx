import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Skeleton from "@mui/material/Skeleton"

export const LoadingCard = () => {
  return (
    <Card variant="outlined" sx={{ borderRadius: "16px" }}>
      <div>
        <CardContent>
          <Typography component="h2">
            <Skeleton animation="wave" height={40} />
          </Typography>
          <Typography variant="subtitle1">
            <Skeleton animation="wave" />
          </Typography>
          <Typography variant="subtitle1">
            <Skeleton animation="wave" />
          </Typography>
        </CardContent>
      </div>
    </Card>
  )
}
