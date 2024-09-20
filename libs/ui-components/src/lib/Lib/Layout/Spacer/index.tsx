export const Spacer = ({ uc }: { uc?: string }) => {
  //@ts-ignore
  return <div className={uc ? `lib-spacer-${uc}` : undefined}></div>
}
