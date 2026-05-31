import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { Answer, Dataset, Scrutin, Taxonomy } from './types'
import { balancedSample, loadData, scoreAgreement } from './dataset'

type Phase = 'intro' | 'quiz' | 'results'

/** Rend un titre de scrutin lisible comme question. */
function cleanTitle(s: Scrutin): string {
  const t = s.title.replace(/^l['’]ensemble (de la |du |de l['’]|des )?/i, '').trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function Quiz() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [data, setData] = useState<{ dataset: Dataset; taxonomy: Taxonomy } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [index, setIndex] = useState(0)

  useEffect(() => {
    loadData()
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [])

  const sample = useMemo(
    () => (data ? balancedSample(data.dataset, data.taxonomy, 2) : []),
    [data],
  )

  if (error) {
    return (
      <Centered>
        <Text color="red.500">Erreur de chargement des données : {error}</Text>
      </Centered>
    )
  }
  if (!data) {
    return (
      <Centered>
        <Spinner size="lg" color="teal.500" />
      </Centered>
    )
  }

  function answer(uid: string, a: Answer) {
    setAnswers((prev) => ({ ...prev, [uid]: a }))
    if (index + 1 < sample.length) setIndex(index + 1)
    else setPhase('results')
  }

  if (phase === 'intro') {
    return (
      <Intro
        count={sample.length}
        meta={data.dataset.meta}
        onStart={() => {
          setAnswers({})
          setIndex(0)
          setPhase('quiz')
        }}
      />
    )
  }

  if (phase === 'quiz') {
    const scrutin = sample[index]
    return (
      <Question
        scrutin={scrutin}
        index={index}
        total={sample.length}
        onAnswer={(a) => answer(scrutin.uid, a)}
        onBack={index > 0 ? () => setIndex(index - 1) : undefined}
      />
    )
  }

  return (
    <Results
      sample={sample}
      answers={answers}
      dataset={data.dataset}
      onRestart={() => setPhase('intro')}
    />
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      {children}
    </Box>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" bg="gray.50" color="gray.900">
      <Container maxW="2xl" py={{ base: 10, md: 16 }}>
        {children}
      </Container>
    </Box>
  )
}

function Intro({
  count,
  meta,
  onStart,
}: {
  count: number
  meta: Dataset['meta']
  onStart: () => void
}) {
  return (
    <Shell>
      <Stack gap={6}>
        <Badge alignSelf="flex-start" colorPalette="teal" size="lg">
          Exercice A · votes de l'Assemblée
        </Badge>
        <Heading size={{ base: '2xl', md: '3xl' }} lineHeight="1.1">
          Et vous, vous auriez voté comment ?
        </Heading>
        <Text color="gray.600" fontSize="lg">
          {count} votes réels de l'Assemblée nationale, sur les {meta.windowMonths}{' '}
          derniers mois. Pour chacun, indiquez ce que vous auriez voté. On
          regardera ensuite de quel groupe vos réponses se rapprochent.
        </Text>
        <Box
          bg="orange.50"
          borderWidth="1px"
          borderColor="orange.200"
          borderRadius="lg"
          p={4}
        >
          <Text fontSize="sm" color="orange.900">
            <strong>À garder en tête.</strong> Un score de proximité compare votre
            réponse à la <em>ligne majoritaire</em> de chaque groupe — pas à la
            conviction de chaque député. Et un même « contre » peut avoir des sens
            opposés selon le contexte. Ce score est un point de départ pour
            comprendre, pas un verdict sur vous.
          </Text>
        </Box>
        <Button colorPalette="teal" size="lg" alignSelf="flex-start" onClick={onStart}>
          Commencer
        </Button>
      </Stack>
    </Shell>
  )
}

function Question({
  scrutin,
  index,
  total,
  onAnswer,
  onBack,
}: {
  scrutin: Scrutin
  index: number
  total: number
  onAnswer: (a: Answer) => void
  onBack?: () => void
}) {
  const isMotion = scrutin.category === 'motion'
  const pct = Math.round(((index + 1) / total) * 100)
  return (
    <Shell>
      <Stack gap={6}>
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.500">
              Question {index + 1} / {total}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {new Date(scrutin.date).toLocaleDateString('fr-FR')}
            </Text>
          </HStack>
          <Box bg="gray.200" borderRadius="full" h="6px" overflow="hidden">
            <Box bg="teal.500" h="100%" w={`${pct}%`} transition="width 0.2s" />
          </Box>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="bold" color="teal.600" mb={1}>
            {isMotion ? 'Motion de censure' : 'Vote sur l’ensemble du texte'}
          </Text>
          <Heading size={{ base: 'lg', md: 'xl' }} lineHeight="1.25">
            {cleanTitle(scrutin)}
          </Heading>
          {isMotion && (
            <Text fontSize="sm" color="gray.500" mt={2}>
              Voter « pour » une motion de censure, c'est chercher à renverser le
              gouvernement.
            </Text>
          )}
        </Box>

        <Stack gap={3}>
          <HStack gap={3}>
            <Button flex={1} colorPalette="green" variant="outline" onClick={() => onAnswer('pour')}>
              Pour
            </Button>
            <Button flex={1} colorPalette="red" variant="outline" onClick={() => onAnswer('contre')}>
              Contre
            </Button>
          </HStack>
          <HStack gap={3}>
            <Button flex={1} colorPalette="gray" variant="outline" onClick={() => onAnswer('abstention')}>
              Abstention
            </Button>
            <Button flex={1} colorPalette="gray" variant="ghost" onClick={() => onAnswer('passer')}>
              Passer
            </Button>
          </HStack>
        </Stack>

        {onBack && (
          <Button variant="plain" size="sm" alignSelf="flex-start" onClick={onBack} color="gray.500">
            ← Précédent
          </Button>
        )}
      </Stack>
    </Shell>
  )
}

function Results({
  sample,
  answers,
  dataset,
  onRestart,
}: {
  sample: Scrutin[]
  answers: Record<string, Answer>
  dataset: Dataset
  onRestart: () => void
}) {
  const scores = useMemo(
    () => scoreAgreement(sample, answers, dataset.groups),
    [sample, answers, dataset.groups],
  )
  const answeredCount = sample.filter((s) => answers[s.uid] && answers[s.uid] !== 'passer').length
  const top = scores.find((s) => s.pct !== null)

  return (
    <Shell>
      <Stack gap={6}>
        <Badge alignSelf="flex-start" colorPalette="teal" size="lg">
          Vos résultats
        </Badge>
        <Heading size={{ base: 'xl', md: '2xl' }}>
          {top ? `Vous êtes le plus proche de ${top.group.abbrev}` : 'Pas assez de réponses'}
        </Heading>
        <Text color="gray.600">
          Sur {answeredCount} votes auxquels vous avez répondu, voici votre taux
          d'accord avec la ligne majoritaire de chaque groupe.
        </Text>

        <Stack gap={3}>
          {scores.map((s) => (
            <Box key={s.group.ref}>
              <HStack justify="space-between" mb={1}>
                <Text fontWeight="medium" fontSize="sm">
                  {s.group.abbrev}
                  <Text as="span" color="gray.400" fontWeight="normal">
                    {' '}— {s.group.name}
                  </Text>
                </Text>
                <Text fontWeight="bold" fontSize="sm" color="gray.700">
                  {s.pct === null ? '—' : `${s.pct}%`}
                </Text>
              </HStack>
              <Box bg="gray.200" borderRadius="full" h="10px" overflow="hidden">
                <Box
                  bg={s === top ? 'teal.500' : 'teal.300'}
                  h="100%"
                  w={`${s.pct ?? 0}%`}
                  transition="width 0.3s"
                />
              </Box>
            </Box>
          ))}
        </Stack>

        <Box bg="orange.50" borderWidth="1px" borderColor="orange.200" borderRadius="lg" p={4}>
          <Text fontSize="sm" color="orange.900">
            <strong>Ce que ce score ne dit pas.</strong> Il mesure un accord avec
            la <em>position de groupe</em>, façonnée par la discipline de vote et
            les calculs tactiques — pas par les convictions individuelles des
            député·es. La proximité avec un groupe n'est pas une adhésion à son
            programme. Prochainement : le détail par thème, et le « démontage »
            des biais.
          </Text>
        </Box>

        <Button colorPalette="teal" variant="outline" alignSelf="flex-start" onClick={onRestart}>
          Recommencer
        </Button>
      </Stack>
    </Shell>
  )
}
