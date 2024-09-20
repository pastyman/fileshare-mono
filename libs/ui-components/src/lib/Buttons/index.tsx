import { useState } from "react"
import { Button } from "../Lib/Form/Button"
import SaveIcon from "@mui/icons-material/Save"
import DeleteIcon from "@mui/icons-material/Delete"
import CircularProgress from "@mui/material/CircularProgress"

export const ButtonAction = ({ ...rest }) => {
  const { sx, onClick, children, ...theRest } = rest

  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    onClick()
  }

  return (
    <Button
      variant="outlined"
      startIcon={
        theRest["disabled"] && isClicked ? (
          <CircularProgress size={15} />
        ) : (
          { children }
        )
      }
      sx={{ ...sx, backgroundColor: "white" }}
      {...theRest}
      onClick={handleClick}
    >
      {theRest["text"]}
    </Button>
  )
}

export const ButtonAdd = ({ ...rest }) => {
  const { sx, onClick, startIcon, ...theRest } = rest

  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    onClick()
  }

  return (
    <Button
      variant="outlined"
      startIcon={
        theRest["disabled"] && isClicked ? (
          <CircularProgress size={15} />
        ) : (
          startIcon
        )
      }
      sx={{ ...sx, backgroundColor: "white" }}
      {...theRest}
      onClick={handleClick}
    >
      {theRest["text"]}
    </Button>
  )
}

export const ButtonSave = ({ ...rest }) => {
  const { sx, onClick, ...theRest } = rest

  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    onClick()
  }

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={
        theRest["disabled"] && isClicked ? (
          <CircularProgress size={15} />
        ) : (
          <SaveIcon />
        )
      }
      sx={{ ...sx, backgroundColor: "white" }}
      {...theRest}
      onClick={handleClick}
    >
      {theRest["text"]}
    </Button>
  )
}

export const ButtonDelete = ({ ...rest }) => {
  const { sx, onClick, ...theRest } = rest

  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    onClick()
  }

  return (
    <Button
      variant="outlined"
      color="warning"
      startIcon={
        theRest["disabled"] && isClicked ? (
          <CircularProgress size={15} />
        ) : (
          <DeleteIcon />
        )
      }
      sx={{ ...sx, backgroundColor: "white" }}
      {...theRest}
      onClick={handleClick}
    >
      {theRest["text"]}
    </Button>
  )
}
