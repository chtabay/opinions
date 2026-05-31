import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import type { ReactNode } from "react"

/**
 * Provider Chakra UI (v3) pour l'application.
 *
 * Version minimale : enveloppe l'app avec le système de thème par défaut.
 * La gestion du mode clair/sombre (snippet `color-mode` + `next-themes`)
 * pourra être ajoutée plus tard si besoin.
 */
export function Provider({ children }: { children: ReactNode }) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
}
