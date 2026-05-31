import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Link,
  Spinner,
  Stack,
  Text,
  Wrap,
} from '@chakra-ui/react'
import type { Answer, Dataset, Scrutin, Taxonomy } from './types'
import { balancedSample, loadData, scoreAgreement } from './dataset'

type Phase = 'intro' | 'quiz' | 'results'

const AN_SCRUTIN = (numero: number) =>
  `https://www.assemblee-nationale.fr/dyn/17/scrutins/${numero}`
const AN_DOSSIER = (ref: string) =>
  `https://www.assemblee-nationale.fr/dyn/17/dossiers/${ref}`

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

  // Sous-thème (id) → libellé, pour afficher les thèmes d'un scrutin.
  const subLabel = useMemo(() => {
    const m = new Map<string, string>()
    if (data) for (const t of data.taxonomy.themes) for (const s of t.subthemes) m.set(s.id, s.label)
    return m
  }, [data])

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

  function recordAnswer(uid: string, a: Answer) {
    setAnswers((prev) => ({ ...prev, [uid]: a }))
  }
  function goNext() {
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
    const themeLabels = scrutin.themes.subthemes.map((id) => subLabel.get(id) ?? id)
    return (
      <Question
        key={scrutin.uid}
        scrutin={scrutin}
        themeLabels={themeLabels}
        index={index}
        total={sample.length}
        onAnswer={(a) => recordAnswer(scrutin.uid, a)}
        onNext={goNext}
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
        <Box bg="orange.50" borderWidth="1px" borderColor="orange.200" borderRadius="lg" p={4}>
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
  themeLabels,
  index,
  total,
  onAnswer,
  onNext,
  onBack,
}: {
  scrutin: Scrutin
  themeLabels: string[]
  index: number
  total: number
  onAnswer: (a: Answer) => void
  onNext: () => void
  onBack?: () => void
}) {
  const [chosen, setChosen] = useState<Answer | null>(null)
  const isMotion = scrutin.category === 'motion'
  const pct = Math.round(((index + 1) / total) * 100)

  function pick(a: Answer) {
    setChosen(a)
    onAnswer(a)
  }

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

        {/* Contexte AVANT réponse : informer sans orienter (thèmes + lien texte),
            sans révéler comment le vote a réellement tourné. */}
        {themeLabels.length > 0 && (
          <Wrap gap={2}>
            {themeLabels.map((l) => (
              <Badge key={l} colorPalette="gray" variant="subtle">
                {l}
              </Badge>
            ))}
          </Wrap>
        )}
        {!chosen && scrutin.dossier?.ref && (
          <Link
            href={AN_DOSSIER(scrutin.dossier.ref)}
            color="teal.600"
            fontSize="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lire le texte (dossier législatif) ↗
          </Link>
        )}

        {!chosen ? (
          <Stack gap={3}>
            <HStack gap={3}>
              <Button flex={1} colorPalette="green" variant="outline" onClick={() => pick('pour')}>
                Pour
              </Button>
              <Button flex={1} colorPalette="red" variant="outline" onClick={() => pick('contre')}>
                Contre
              </Button>
            </HStack>
            <HStack gap={3}>
              <Button flex={1} colorPalette="gray" variant="outline" onClick={() => pick('abstention')}>
                Abstention
              </Button>
              <Button flex={1} colorPalette="gray" variant="ghost" onClick={() => pick('passer')}>
                Passer
              </Button>
            </HStack>
            {onBack && (
              <Button variant="plain" size="sm" alignSelf="flex-start" onClick={onBack} color="gray.500">
                ← Précédent
              </Button>
            )}
          </Stack>
        ) : (
          <Reveal scrutin={scrutin} chosen={chosen} onNext={onNext} isLast={index + 1 === total} />
        )}
      </Stack>
    </Shell>
  )
}

/** Bloc révélé APRÈS la réponse : résultat réel + décompte + source officielle. */
function Reveal({
  scrutin,
  chosen,
  onNext,
  isLast,
}: {
  scrutin: Scrutin
  chosen: Answer
  onNext: () => void
  isLast: boolean
}) {
  const adopté = scrutin.sort === 'adopté'
  const choiceLabel: Record<Answer, string> = {
    pour: 'Pour',
    contre: 'Contre',
    abstention: 'Abstention',
    passer: 'Passé',
  }
  return (
    <Stack gap={4}>
      <Text fontSize="sm" color="gray.500">
        Votre réponse : <strong>{choiceLabel[chosen]}</strong>
      </Text>
      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={4}>
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold" fontSize="sm">
            Ce qu'a décidé l'Assemblée
          </Text>
          <Badge colorPalette={adopté ? 'green' : 'gray'} variant="subtle">
            {adopté ? 'Adopté' : 'Rejeté'}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          Pour {scrutin.synthese.pour} · Contre {scrutin.synthese.contre} ·
          Abstention {scrutin.synthese.abstention}
        </Text>
        <Link
          href={AN_SCRUTIN(scrutin.numero)}
          color="teal.600"
          fontSize="sm"
          mt={2}
          display="inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          Voir l'analyse officielle du scrutin (vote par groupe et député) ↗
        </Link>
      </Box>
      <Button colorPalette="teal" alignSelf="flex-start" onClick={onNext}>
        {isLast ? 'Voir mes résultats' : 'Continuer'}
      </Button>
    </Stack>
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
