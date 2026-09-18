import React, { ReactNode, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import { LoadingForm } from "../Loading/LoadingForm"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import CloseIcon from "@mui/icons-material/Close"
import { Container } from "../Lib/Layout/Container"
import { Txt } from "../Lib/Text/Txt"
import { Button } from "../Lib/Form/Button"
import { AlertConfirm } from "../AlertConfirm"
import { DividerThin } from "../Dividers"
import styled from "styled-components"
import Box from "@mui/material/Box"
import { StyledBox } from "../StyledBox"
import { Spacer } from "../Lib/Layout/Spacer"

const Selector = ({
  name,
  subheading,
  index,
  children,
  handleDelete,
  onEdit,
  showChildren,
  level,
}: {
  name?: string
  subheading?: string
  index: number
  children: ReactNode
  handleDelete: Function
  onEdit: Function
  showChildren: boolean
  level: number
}) => {
  return (
    <StyledBox uc={`multiBox${level}`} ucHover={`multiBox${level}Hover`}>
      <Box sx={{ display: "flex", minHeight: "40px" }}>
        <Box sx={{ p: 0, width: "100%" }}>
          {name && <Heading>{name}</Heading>}
          {name && subheading && <Spacer uc="small" />}
          {subheading && <SubHeading>{subheading}</SubHeading>}
          <Spacer uc="small" />
        </Box>
        <Box
          sx={{
            pl: 1,
            flexShrink: 0,
            minWidth: "80px",
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => handleDelete(index)}
              color="error"
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              onClick={() => onEdit(index)}
              color="primary"
              aria-label="edit"
            >
              {showChildren ? <CloseIcon /> : <EditIcon />}
            </IconButton>
          </Stack>
        </Box>
      </Box>
      <div style={showChildren ? {} : { display: "none" }}>{children}</div>
    </StyledBox>
  )
}

export const MultiItem = ({
  name,
  subheading = "",
  children,
}: {
  name: string
  subheading?: string
  children: ReactNode
}) => {
  return <>{children}</>
}

export type UseMulti = {
  open: (i: number) => void
  openIndex: number
}

export const useMulti = () => {
  const [openIndex, setOpenIndex] = useState(-1)
  return { open: (i: number) => setOpenIndex(i), openIndex }
}

export const Multi = ({
  name,
  children,
  onAdd,
  onDelete,
  onOpenChange,
  open = -1,
  isFormLoading = false,
  level = 1,
  addButtonTxt = "Add",
  addMode = "prepend",
}: {
  name?: string
  children: React.ReactElement<{ name?: string; subheading?: string }>[]
  onAdd: () => void
  onDelete: (i: number) => void
  onOpenChange: (i: number) => void
  open: number
  isFormLoading: Boolean
  level?: number
  addButtonTxt?: string
  addMode?: "prepend" | "append"
}) => {
  const handleDelete = async (index: number) => {
    const [isOk] = await AlertConfirm(
      "Are you sure you want to delete this item?"
    )
    if (isOk) {
      //call passed delete
      onOpenChange(-1)
      onDelete(index)
    }
  }

  const handleAdd = async () => {
    //open
    onAdd()
    onOpenChange(addMode === "prepend" ? 0 : children.length)
  }

  const handleEdit = async (index: number) => {
    //open
    onOpenChange(open === index ? -1 : index)
  }

  return (
    <>
      {!isFormLoading ? (
        <>
          {name && (
            <>
              <Txt uc="h1">{name}</Txt>
              <DividerThin />
            </>
          )}
          {addMode === "prepend" && (
            <Container uc="rowBox">
              <Button
                startIcon={<AddIcon />}
                sx={{ height: "50%", marginLeft: "auto" }}
                onClick={() => handleAdd()}
              >
                {addButtonTxt}
              </Button>
            </Container>
          )}
          {children.map((child, i) => (
            <React.Fragment key={i}>
              <Selector
                name={child.props.name}
                subheading={child.props.subheading}
                index={i}
                handleDelete={handleDelete}
                onEdit={handleEdit}
                children={child}
                showChildren={i === open}
                level={level}
              />
            </React.Fragment>
          ))}
          {addMode === "append" && (
            <Container uc="rowBox">
              <Button
                startIcon={<AddIcon />}
                sx={{ height: "50%", marginLeft: "auto" }}
                onClick={() => handleAdd()}
              >
                {addButtonTxt}
              </Button>
            </Container>
          )}
        </>
      ) : (
        <LoadingForm />
      )}
    </>
  )
}

const Heading = styled.div`
  font-size: 18;
  font-weight: bold;
`

const SubHeading = styled.div`
  font-size: 12;
  color: #aaa;
  word-break: break-word;
`
