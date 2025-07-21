import { createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config'

const tamaguiConfig = createTamagui({
  ...config,
  fontLanguages: [],
})

export default tamaguiConfig 