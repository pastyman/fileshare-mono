import { Alert } from "@mui/material"
import { LoadingForm } from "./Loading/LoadingForm"
import {
  Control,
  Controller,
  FieldErrors,
  get,
  Path,
  RegisterOptions,
} from "react-hook-form"
import { Input } from "./Lib/Form/Input"
import { Spacer } from "./Lib/Layout/Spacer"
import { Txt } from "./Lib/Text/Txt"

export const ControlledInput = <A extends {}>({
  title,
  subtitle,
  control,
  placeholder,
  name,
  multiline = false,
  number = false,
  errors,
  rules = {},
  isFormLoading = false,
  disabled = false,
}: {
  title?: string
  subtitle?: string
  number?: boolean
  control: Control<any>
  placeholder: string
  name: Path<A>
  multiline?: boolean
  errors: FieldErrors<A>
  rules?: RegisterOptions<A>
  isFormLoading?: Boolean
  disabled?: Boolean
}) => (
  <div>
    {title && (
      <>
        <Txt uc="formHeading">{title}</Txt>
        <Spacer uc="small" />
      </>
    )}
    {subtitle && (
      <>
        <Txt uc="formHeadingSmall">{subtitle}</Txt>
      </>
    )}
    <Spacer uc="small" />
    {!isFormLoading ? (
      <Controller
        rules={{
          required: "This field is required",
          ...rules,
        }}
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            sx={{}}
            placeholder={placeholder}
            multiline={multiline}
            rows={multiline ? 10 : 1}
            type={number ? "number" : undefined}
            {...field}
            ref={undefined}
            disabled={disabled}
          />
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
