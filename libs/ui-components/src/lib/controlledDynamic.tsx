import React from "react"
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
import { Spacer } from "./Lib/Layout/Spacer"
import { Txt } from "./Lib/Text/Txt"

export const ControlledDynamic = <A extends {}>({
  title,
  subtitle,
  control,
  name,
  errors,
  rules = { required: "This field is required" },
  children,
  transform,
  isFormLoading = false,
}: {
  title?: string
  subtitle?: string
  control: Control<any>
  name: Path<A>
  errors: FieldErrors<A>
  rules?: RegisterOptions<A>
  children: React.ReactElement
  transform?: { input: (value: string) => {}; output: (value: string) => {} }
  isFormLoading?: Boolean
}) => (
  <div>
    {title && <Txt uc="formHeading">{title}</Txt>}
    {title && subtitle && <Spacer uc="small" />}
    {subtitle && <Txt uc="formHeadingSmall">{subtitle}</Txt>}
    <Spacer uc="small" />
    {!isFormLoading ? (
      <Controller
        rules={rules}
        name={name}
        control={control}
        render={({ field }) =>
          transform ? (
            <>
              {React.cloneElement(children, {
                ...field,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  field.onChange(transform.output(e.target.value)),
                value: transform.input(field.value),
                ref: undefined,
              })}
            </>
          ) : (
            <>{React.cloneElement(children, { ...field, ref: undefined })}</>
          )
        }
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
