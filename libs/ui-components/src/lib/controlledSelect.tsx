import { Alert } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import { LoadingForm } from "./Loading/LoadingForm"
import {
  Control,
  Controller,
  FieldErrors,
  get,
  Path,
  RegisterOptions,
} from "react-hook-form"
import { Select } from "./Lib/Form/Select"
import { Spacer } from "./Lib/Layout/Spacer"
import { Txt } from "./Lib/Text/Txt"

export const ControlledSelect = <A extends {}>({
  title,
  subtitle,
  control,
  placeholder,
  name,
  data,
  errors,
  rules = {},
  isFormLoading,
}: {
  title: string
  subtitle?: string
  number?: boolean
  control: Control<any>
  placeholder: string
  name: Path<A>
  data: { name: string; value: string }[] | undefined
  errors: FieldErrors<A>
  rules?: RegisterOptions<A>
  isFormLoading: Boolean
}) => (
  <div>
    <Txt uc="formHeading">{title}</Txt>
    <Spacer uc="small" />
    {subtitle && (
      <>
        <Txt uc="formHeadingSmall">{subtitle}</Txt>
      </>
    )}
    <Spacer uc="small" />
    {data && !isFormLoading ? (
      <Controller
        rules={{
          required: "This field is required",
          ...rules,
        }}
        name={name}
        control={control}
        render={({ field }) => (
          <Select sx={{}} placeholder={placeholder} {...field}>
            {data.map((item, i) => (
              <MenuItem value={item.value} key={i}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        )}
      ></Controller>
    ) : (
      <LoadingForm />
    )}
    {errors && get(errors, name) && (
      <>
        <Spacer uc="small" />{" "}
        <Alert severity="error">{get(errors, name)?.message}</Alert>
      </>
    )}
  </div>
)
