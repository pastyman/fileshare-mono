import React, { useState } from "react"
import { useRouter } from "next/router"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Alert from "@mui/material/Alert"
import { Container, Spacer, StyledBox, Txt } from "ui-components"

const Login = () => {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (response.ok) {
        router.replace("/")
        return
      }
      const body = await response.json().catch(() => ({}))
      setError(body.error || "Sign in failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container uc="mainCenter">
      <Spacer uc="large" />
      <StyledBox uc="solidBox" ucHover="solidBox">
        <form onSubmit={handleSubmit}>
          <Txt uc="boxHeading">sharefolder:admin</Txt>
          <Spacer uc="small" />
          <Txt uc="boxTxt">Owner sign in</Txt>
          <Spacer uc="medium" />
          <TextField
            type="password"
            placeholder="Password"
            inputProps={{ "aria-label": "Password" }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            fullWidth
            size="small"
          />
          <Spacer uc="medium" />
          {error && (
            <>
              <Alert severity="error">{error}</Alert>
              <Spacer uc="medium" />
            </>
          )}
          <Button type="submit" variant="contained" disabled={busy || !password}>
            Sign in
          </Button>
        </form>
      </StyledBox>
    </Container>
  )
}

export default Login
