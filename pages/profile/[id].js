import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import {
  Button,
  ChakraProvider,
  Flex,
  useToast,
  Text,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
} from "@chakra-ui/react"
import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `${pid ?? id}`

const MAIN_PROCESS_ID = "jIRuxblllcBIDUmYbrbbEI90nJs40duNA6wR6NkYVvI"
const USERTX_PROCESS_ID = "566F7MCrrBhr87n7Hs5JKyEQeRlAT9A14G4OWxfS4kQ"
export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

export default function Home({ _id = null }) {
  const toast = useToast()
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [isPending, setIsPending] = useState(false)
  const [userMarkets, setUserMarkets] = useState([])
  const [userTransactions, setUserTransactions] = useState([])
  const { handleMessageResultError, connectWallet } = useAppContext()

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

  useEffect(() => {
    if (pid) {
      ;(async () => {
        await hasWaitFor()
        await fetchMarkets()
        await fetchUser()
      })()
    }
  }, [pid])

  const hasWaitFor = async () => {
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "HasWaitFor" },
          {
            name: "ProfileId",
            value: pid, // user wallet address
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      setIsPending(jsonData.HasWaitFor)
      toast({
        description: jsonData.HasWaitFor
          ? "You have a pending market creation"
          : "No pending market creation",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const resetWaitFor = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    try {
      const messageId = await message({
        process: MAIN_PROCESS_ID,
        tags: [
          {
            name: "Action",
            value: "ResetWaitFor",
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: MAIN_PROCESS_ID,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return

      const jsonData = _result?.Messages[0]?.Data
      console.log("jsonData", jsonData)
      await hasWaitFor()
      toast({
        description: jsonData,
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const fetchMarkets = async () => {
    console.log("fetchMarkets")
    try {
      const _result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [
          { name: "Action", value: "Creator" },
          {
            name: "ProfileId",
            value: pid,
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("fetchMarkets jsonData", jsonData)
      setUserMarkets(jsonData?.Markets)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchUser = async () => {
    console.log("fetchUser")
    try {
      const _result = await dryrun({
        process: USERTX_PROCESS_ID,
        tags: [
          { name: "Action", value: "User" },
          {
            name: "ProfileId",
            value: pid,
          },
        ],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("fetchUser jsonData", jsonData)
      setUserTransactions(jsonData?.Markets)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ChakraProvider>
      <Flex
        direction="column"
        align="center"
        p={4}
        bg="#1a1a2e" // Dark purple background
        minHeight="100vh"
        color="white"
      >
        <AppHeader />
        <Flex paddingY={8}></Flex>

        <Flex
          flexDirection="column"
          gap={4}
          align="center"
          borderRadius="md"
          width="100%"
          maxW="lg"
        >
          <Flex paddingY={4}></Flex>
          {isPending && (
            <Text color="red.500">You have a pending market creation</Text>
          )}
          <Button
            width="100%"
            colorScheme="purple"
            bg="#7023b6"
            onClick={async (event) => {
              const button = event.target
              button.disabled = true
              await hasWaitFor()
              button.disabled = false
            }}
          >
            Check Pending Market
          </Button>

          <Button
            width="100%"
            colorScheme="purple"
            bg="#7023b6"
            onClick={async (event) => {
              const button = event.target
              button.disabled = true
              await resetWaitFor()
              button.disabled = false
            }}
          >
            Reset Pending Market
          </Button>

          <Flex paddingY={8}></Flex>

          <Tabs
            isFitted
            colorScheme="purple"
            variant="line"
            w="100%"
            onChange={async (index) => {
              if (index === 0) {
                await fetchMarkets()
              } else if (index === 1) {
                await fetchUser()
              }
            }}
          >
            <TabList>
              <Tab>Created</Tab>
              <Tab>Transacted</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {userMarkets?.length > 0 ? (
                  <Flex direction="column" width="100%" maxW="lg">
                    <Text fontSize="xs" color="gray.400" paddingBottom={2}>
                      MARKET PROCESS ID
                    </Text>
                    {userMarkets.map((record, index) => (
                      <Flex
                        key={index}
                        align="center"
                        justify="space-between"
                        py={2}
                        px={4}
                        bg="#1a1a2e"
                        _hover={{ bg: "#3e3e5e" }}
                      >
                        <Text
                          isTruncated
                          as="a"
                          href={`/market/${record?.MarketProcessId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="whiteAlpha.800"
                          textDecoration="underline"
                          _hover={{ cursor: "pointer" }}
                          textUnderlineOffset={5}
                        >
                          {record?.Title}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Text color="#7023b6">No market found</Text>
                )}
              </TabPanel>
              <TabPanel>
                {userTransactions?.length > 0 ? (
                  <Flex direction="column" width="100%" maxW="lg">
                    <Text fontSize="xs" color="gray.400" paddingBottom={2}>
                      MARKET PROCESS ID
                    </Text>
                    {userTransactions?.map((record, index) => (
                      <Flex
                        key={index}
                        align="center"
                        justify="space-between"
                        py={2}
                        px={4}
                        bg="#1a1a2e"
                        _hover={{ bg: "#3e3e5e" }}
                      >
                        <Text
                          isTruncated
                          as="a"
                          href={`/market/${record.MarketProcessId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="whiteAlpha.800"
                          textDecoration="underline"
                          _hover={{ cursor: "pointer" }}
                          textUnderlineOffset={5}
                        >
                          {record.Title}
                        </Text>
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Text color="#7023b6">No transaction found</Text>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>

        <Flex paddingY={8}></Flex>
      </Flex>
    </ChakraProvider>
  )
}
