import Reactotron from 'reactotron-react-native'
import { QueryClientManager, reactotronReactQuery } from 'reactotron-react-query'
import { queryClient } from '@/api/queryClient'

/**
 * Dev-only inspector: shows network requests (via the `networking` plugin,
 * which patches XMLHttpRequest — axios rides on top of it automatically)
 * and React Query cache state. Never imported outside `__DEV__`.
 */
if (__DEV__) {
  const queryClientManager = new QueryClientManager({ queryClient })

  Reactotron.configure({
    name: 'MyCachifa',
    onDisconnect: () => queryClientManager.unsubscribe(),
  })
    .useReactNative({ networking: {} })
    .use(reactotronReactQuery(queryClientManager))
    .connect()
}

export default Reactotron
