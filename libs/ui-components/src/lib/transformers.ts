export const transformDateLocalDateUTC = {
  input: (value: string) => {
    //make browser input happy
    return value ? value.split("Z")[0] : value
  },
  output: (value: string) => {
    //convert back to UTC
    return value ? value + "Z" : value
  },
}
