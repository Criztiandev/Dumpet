import HeadTag from "@/components/HeadTag"
import { AppContextProvider } from "@/context/AppContext"
import { ArNext } from "arnext"

export default function App(props) {
  return (
    <>
      <AppContextProvider>
        <HeadTag />
        <ArNext {...props} />
      </AppContextProvider>
    </>
  )
}
