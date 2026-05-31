import {
  Badge,
  Box,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'

type Objectif = {
  ordre: string
  titre: string
  description: string
}

const objectifs: Objectif[] = [
  {
    ordre: '01',
    titre: 'Comprendre les biais',
    description:
      "D'un questionnaire, d'un vote, d'une comparaison de programmes. C'est l'objectif central : rendre visible la machinerie qui fabrique un score.",
  },
  {
    ordre: '02',
    titre: 'Approfondir les sujets',
    description:
      "Transformer une intuition (« je suis pour / contre ») en compréhension argumentée d'un enjeu réel, y compris contre soi-même.",
  },
  {
    ordre: '03',
    titre: 'Situer son positionnement',
    description:
      'Utile et ludique, mais subordonné aux deux premiers. Jamais présenté comme une vérité sur soi.',
  },
]

function App() {
  return (
    <Box minH="100dvh" bg="gray.50" color="gray.900">
      <Container maxW="3xl" py={{ base: 12, md: 20 }}>
        <Stack gap={10}>
          <Stack gap={4}>
            <Badge alignSelf="flex-start" colorPalette="teal" size="lg">
              GlobéNostra · module Opinions
            </Badge>
            <Heading size={{ base: '2xl', md: '4xl' }} lineHeight="1.1">
              Un atelier de lucidité politique
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
              Opinions n'est pas un test qui vous range dans une case. Le score
              n'est que la porte d'entrée : le vrai objet est de rendre visibles
              les biais qui le fabriquent, et de donner envie d'approfondir les
              sujets.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {objectifs.map((o) => (
              <Box
                key={o.ordre}
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="xl"
                p={6}
              >
                <Stack gap={2}>
                  <Text fontSize="sm" fontWeight="bold" color="teal.500">
                    {o.ordre}
                  </Text>
                  <Heading size="md">{o.titre}</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {o.description}
                  </Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>

          <HStack
            gap={3}
            color="gray.500"
            fontSize="sm"
            pt={4}
            borderTopWidth="1px"
            borderColor="gray.200"
          >
            <Text>Phase 1 — construction du test</Text>
            <Text>·</Text>
            <Text>Vite + React + Chakra UI</Text>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
