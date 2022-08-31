import React, { useState } from "react"
import { nanoid } from "nanoid"

import sanityClient from "part:@sanity/base/client"
import {
  useToast,
  Box,
  Stack,
  Button,
  Spinner,
  Dialog,
  TextInput,
  TextArea,
  Select,
  Label,
} from "@sanity/ui"

const WEBHOOK_TYPE = "webhook_deploy"
const client = sanityClient.withConfig({apiVersion: '2021-03-25'})

const DeployModalEdit = ({ onClose, hook }) => {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [pendingHook, setPendingHook] = useState({
    title: "",
    url: "",
    statusBadgeUrl: "",
    githubToken: "",
    dataset: "",
    githubBody: "",
  })
  const isFormDisabled =
    !pendingHook.title || !pendingHook.url || !pendingHook.statusBadgeUrl

  const onCloseEditModal = () => {
    onClose(false)
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    setIsLoading(true)

    try {
      await client.create({
        _id: `github-deploy.${nanoid()}`,
        _type: WEBHOOK_TYPE,
        title: pendingHook.title,
        url: pendingHook.url,
        statusBadgeUrl: pendingHook.statusBadgeUrl,
        githubToken: pendingHook.githubToken,
        dataset: pendingHook.dataset,
        githubBody: pendingHook.githubBody,
      })
    } catch (error) {
      toast.push({
        status: "error",
        title: "An error occured in creating this webhook.",
      })
    }

    setIsLoading(false)

    toast.push({
      status: "success",
      title: `Added ${pendingHook.title}!`,
    })

    onCloseEditModal()
  }

  return (
    <Dialog
      width={1}
      header="Edit github Enviroment"
      onClose={onCloseEditModal}
    >
      <Box padding={4}>
        <form onSubmit={onSubmit}>
          <Stack space={5}>
            <Box>
              <Box marginBottom={3}>
                <Label>Title</Label>
              </Box>
              <TextInput
                value={pendingHook.title || hook.title}
                onChange={(event) =>
                  setPendingHook({
                    ...pendingHook,
                    title: event.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <Box marginBottom={3}>
                <Label>URL</Label>
              </Box>
              <TextInput
                value={pendingHook.url || hook.url}
                onChange={(event) =>
                  setPendingHook({
                    ...pendingHook,
                    url: event.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <Box marginBottom={3}>
                <Label>Status Badge URL</Label>
              </Box>
              <TextInput
                value={pendingHook.statusBadgeUrl || hook.statusBadgeUrl}
                onChange={(event) =>
                  setPendingHook({
                    ...pendingHook,
                    statusBadgeUrl: event.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <Box marginBottom={3}>
                <Label>Dataset</Label>
              </Box>
              <Select
                value={pendingHook.dataset || hook.dataset}
                onChange={(event) =>
                  setPendingHook({
                    ...pendingHook,
                    dataset: event.target.value,
                  })
                }
              >
                <optgroup label="Datasets">
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                </optgroup>
              </Select>
            </Box>
            <Box>
              <Box marginBottom={3}>
                <Label>Token</Label>
              </Box>
              <TextInput
                value={pendingHook.githubToken}
                onChange={(event) =>
                  setPendingHook({
                    ...pendingHook,
                    githubToken: event.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <Box marginBottom={3}>
                <Label>RequestBody</Label>
              </Box>
              <TextArea
                height={10}
                value={pendingHook.githubBody || hook.githubBody}
                onChange={(event) =>
                  setPendingHook({
                    ...pendingHook,
                    githubBody: event.target.value,
                  })
                }
              />
            </Box>

            <Box>
              {isLoading ? (
                <Spinner />
              ) : (
                <Button
                  disabled={isFormDisabled}
                  type="submit"
                  tone="primary"
                  text={isFormDisabled ? "Fill out required fields." : "Create"}
                />
              )}
            </Box>
          </Stack>
        </form>
      </Box>
    </Dialog>
  )
}

export default DeployModalEdit
