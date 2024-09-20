import OutlinedInput from "@mui/material/OutlinedInput"
import FormControl from "@mui/material/FormControl"

export const Input = ({ sx = {}, ...rest }) => {
  return (
    <FormControl fullWidth>
      <OutlinedInput className="lib-form-input" sx={sx} {...rest} />
    </FormControl>
  )
}
