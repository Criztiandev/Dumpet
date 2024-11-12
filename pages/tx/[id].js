import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  Button,
  ChakraProvider,
  Divider,
  Flex,
  Input,
  useToast,
  Text,
  Heading,
  FormControl,
  FormHelperText,
  Spacer,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"
import TelegramIcon from "@/components/icons/TelegramIcon"
import TwitterIcon from "@/components/icons/TwitterIcon"
import UserIcon from "@/components/icons/UserIcon"
import AppHeader from "@/components/AppHeader"
import { useAppContext } from "@/context/AppContext"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `${pid ?? id}`

export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

const DUMPET_TOKEN_TXID = "fzkhRptIvW3tJ7Dz7NFgt2DnZTJVKnwtzEOuURjfXrQ"

export default function Home({ _id = null }) {
  const { id } = useParams()
  const [pid, setPid] = useState(_id)
  const [tokenTxId, setTokenTxId] = useState("")
  const [jsonData, setJsonData] = useState()
  const [amount, setAmount] = useState(1)
  const [amountOfVote, setAmountOfVote] = useState(1)
  const [userBalance, setUserBalance] = useState(-1)

  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    setIsConnected,
    userAddress,
    setUserAddress,
    multiplyByPower,
    divideByPower,
  } = useAppContext()

  useEffect(() => {
    ;(async () => {
      _id ?? setPid(await getID(id, _id))
    })()
  }, [])

  useEffect(() => {
    console.log("pid", pid)
    if (pid) {
      ;(async () => {
        await getMarketInfo()
      })()
    }
  }, [pid])

  const handleMessageResultError = (_result) => {
    const errorTag = _result?.Messages?.[0]?.Tags.find(
      (tag) => tag.name === "Error"
    )
    console.log("errorTag", errorTag)
    if (errorTag) {
      toast({
        description: _result.Messages[0].Data,
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      })
      return true
    }
    return false
  }

  const getMarketInfo = async () => {
    try {
      const result = await dryrun({
        process: id,
        tags: [{ name: "Action", value: "GetMarketInfo" }],
      })

      console.log("result", result)
      const _jsonData = JSON.parse(result?.Messages[0]?.Data)
      console.log("_jsonData", _jsonData)
      setJsonData(_jsonData)
      setTokenTxId(_jsonData?.TokenTxId)
      console.log("TokenTxId", _jsonData?.TokenTxId)
    } catch (error) {
      console.error(error)
    }
  }

  const deposit = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(amount)
    console.log("_amount", _amount)

    try {
      const messageId = await message({
        process: DUMPET_TOKEN_TXID,
        tags: [
          {
            name: "Action",
            value: "Transfer",
          },
          {
            name: "Quantity",
            value: _amount.toString(),
          },
          {
            name: "Recipient",
            value: pid,
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: DUMPET_TOKEN_TXID,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return
    } catch (error) {
      console.error(error)
    }
  }

  const getTokenTxId = async () => {
    try {
      const _result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "GetTokenTxId" }],
      })
      console.log("_result", _result)
      console.log("_result?.Messages[0]?.Data", _result?.Messages[0]?.Data)
    } catch (error) {
      console.error(error)
    }
  }

  const getBalances = async () => {
    try {
      const _result = await dryrun({
        process: pid,
        tags: [{ name: "Action", value: "Balances" }],
      })
      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  const getBalance = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }
    const _userAddress = _connected.userAddress

    try {
      const _result = await dryrun({
        process: pid,
        tags: [
          { name: "Action", value: "Balance" },
          { name: "Recipient", value: _userAddress },
        ],
      })
      console.log("_result", _result)

      const jsonData = JSON.parse(_result?.Messages[0]?.Data)
      console.log("jsonData", jsonData)
      setUserBalance(divideByPower(jsonData))
    } catch (error) {
      console.error(error)
    }
  }

  const voteA = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(amountOfVote)
    console.log("_amount", _amount)

    try {
      const messageId = await message({
        process: pid,
        tags: [
          {
            name: "Action",
            value: "OptionA",
          },
          {
            name: "Quantity",
            value: _amount.toString(),
          }
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: pid,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return
    } catch (error) {
      console.error(error)
    }
  }

  const voteB = async () => {
    const _connected = await connectWallet()
    if (_connected.success === false) {
      return
    }

    const _amount = multiplyByPower(amountOfVote)
    console.log("_amount", _amount)

    try {
      const messageId = await message({
        process: pid,
        tags: [
          {
            name: "Action",
            value: "OptionB",
          },
        ],
        signer: createDataItemSigner(globalThis.arweaveWallet),
      })
      console.log("messageId", messageId)

      const _result = await result({
        message: messageId,
        process: pid,
      })
      console.log("_result", _result)
      if (handleMessageResultError(_result)) return
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <ChakraProvider>
        <Flex
          flexDirection="column"
          alignItems="center"
          p={5}
          bg="#f3f0fa"
          minH="100vh"
        >
          <AppHeader />

          <Flex
            flexDirection="column"
            gap={4}
            align="center"
            borderRadius="md"
            width="100%"
            maxW="lg"
          >
            <FormControl>
              <FormHelperText fontSize="xs">Market ProcessId</FormHelperText>
              <Text maxW="lg">{pid}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Title</FormHelperText>
              <Text maxW="lg">{jsonData?.Title}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Duration</FormHelperText>
              <Text maxW="lg">{jsonData?.Duration}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Token TxId</FormHelperText>
              <Text maxW="lg">{jsonData?.TokenTxId}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Amount of Vote</FormHelperText>
              <NumberInput
                precision={2}
                value={amountOfVote}
                min={1}
                onChange={(e) => {
                  setAmountOfVote(e)
                }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">OptionA</FormHelperText>
              <Text maxW="lg">{jsonData?.OptionA}</Text>

              <Button colorScheme="purple" w="100%" maxW="lg" onClick={voteA}>
                Vote A
              </Button>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">OptionB</FormHelperText>
              <Text maxW="lg">{jsonData?.OptionB}</Text>
              <Button colorScheme="purple" w="100%" maxW="lg" onClick={voteB}>
                Vote B
              </Button>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Creator</FormHelperText>
              <Text maxW="lg">{jsonData?.Creator}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">BlockHeight</FormHelperText>
              <Text maxW="lg">{jsonData?.BlockHeight}</Text>
            </FormControl>
            <FormControl>
              <FormHelperText fontSize="xs">Timestamp</FormHelperText>
              <Text maxW="lg">{jsonData?.Timestamp}</Text>
            </FormControl>

            <FormControl>
              <FormHelperText fontSize="xs">Amount</FormHelperText>
              <NumberInput
                precision={2}
                value={amount}
                min={1}
                onChange={(e) => {
                  setAmount(e)
                }}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Flex paddingY={1}></Flex>
              <Button colorScheme="purple" w="100%" maxW="lg" onClick={deposit}>
                Deposit
              </Button>
              <Flex paddingY={1}></Flex>
              <Button colorScheme="purple" w="100%" maxW="lg">
                Withdraw
              </Button>
              <Flex paddingY={4}></Flex>
            </FormControl>
            <Button
              colorScheme="purple"
              w="100%"
              maxW="lg"
              onClick={getBalances}
            >
              Get Balances
            </Button>
            <FormControl>
              <FormHelperText fontSize="xs">User Balance</FormHelperText>
              {userBalance >= 0 ? (
                <Text maxW="lg">{userBalance}</Text>
              ) : (
                <Text maxW="lg">-</Text>
              )}
              <Button
                colorScheme="purple"
                w="100%"
                maxW="lg"
                onClick={getBalance}
              >
                Get User Balance
              </Button>
            </FormControl>
            <Button
              colorScheme="purple"
              w="100%"
              maxW="lg"
              onClick={getTokenTxId}
            >
              getTokenTxId
            </Button>
            <Button colorScheme="purple" w="100%" maxW="lg">
              Conclude
            </Button>
          </Flex>
        </Flex>
      </ChakraProvider>
    </>
  )
}
