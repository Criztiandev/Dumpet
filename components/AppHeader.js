import { ChakraProvider, Divider, Flex, Text } from "@chakra-ui/react"
import { Link } from "arnext"
import TelegramIcon from "./icons/TelegramIcon"
import TwitterIcon from "./icons/TwitterIcon"
import LoginModal from "./LoginModal"

export default function AppHeader() {
  return (
    <ChakraProvider>
      <Flex w="full" justify="space-between" align="center" paddingX={[0, 8]}>
        <Text fontSize="3xl" color="#7023b6" fontWeight="bold">
          Dumpet
        </Text>
        <Flex gap={4} alignItems="center">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://t.me/dumpetdotfun"
          >
            <TelegramIcon strokeColor="#7023b6" size={18} />
          </Link>

          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://x.com/dumpetdotfun"
          >
            <TwitterIcon strokeColor="#7023b6" size={18} />
          </Link>

          <Flex paddingX={[0, 2]}></Flex>

          <LoginModal />
        </Flex>
      </Flex>
      <Divider />
      <Flex paddingY={8}></Flex>
    </ChakraProvider>
  )
}
