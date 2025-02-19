import {Box, Button, Heading, HStack, Stack, Text} from '@chakra-ui/react'
import {Meta} from '@/type'
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import {ExternalLinkIcon} from 'lucide-react'
import Link from 'next/link'

type Props = {
  meta: Meta
}

type Member = {
  name: string
  enName: string
  role: string
}
const members: Member[] = [
  {
    name: '安野 貴博',
    enName: 'ANNO Takahiro',
    role: 'Organizer',
  },
  {
    name: '根本 紘志',
    enName: 'NEMOTO Hiroshi',
    role: 'Lead',
  },
  {
    name: '西尾 泰和',
    enName: 'NISHIO Hirokazu',
    role: 'Research / ML',
  },
  {
    name: '角野 為耶',
    enName: 'SUMINO Nasuka',
    role: 'Research / ML',
  },
  {
    name: '小林 修平',
    enName: 'KOBAYASHI Syuhei',
    role: 'Web Develop / Design',
  },
]

export function Footer({meta}: Props) {
  return (
    <footer>
      <Stack direction={{base: 'column', lg: 'row'}} justify={'space-between'} maxW={'800px'} mx={'auto'}>
        <HStack gap={5} justify={'center'} align={'center'}>
          <Text fontWeight={'bold'} fontSize={'lg'}>{meta.reporterName}</Text>
          {meta.privacyLink && (
            <Link href={meta.privacyLink} target={'_blank'} rel={'noopener noreferrer'}>
              <Text fontSize={'xs'} className={'textLink'}>プライバシーポリシー</Text>
            </Link>
          )}
          {meta.termsLink && (
            <Link href={meta.termsLink} target={'_blank'} rel={'noopener noreferrer'}>
              <Text fontSize={'xs'} className={'textLink'}>利用規約</Text>
            </Link>
          )}
        </HStack>
        <HStack justify={'center'}>
          <DrawerRoot placement={'bottom'}>
            <DrawerBackdrop/>
            <DrawerTrigger>
              <Text className={'textLink'} cursor={'pointer'}>デジタル民主主義2030プロジェクトについて</Text>
            </DrawerTrigger>
            <DrawerContent roundedTop={'md'} p={5}>
              <DrawerHeader>
                <DrawerTitle
                  fontSize={'2xl'}
                  fontWeight={'bold'}
                  textAlign={'center'}
                  className={'gradientColor'}
                >デジタル民主主義2030プロジェクト</DrawerTitle>
              </DrawerHeader>
              <DrawerBody textAlign={'center'}>
                <Box mb={8} maxW={'700px'} mx={'auto'}>
                  <Heading size={'lg'} mb={2} textAlign={'center'}>プロジェクトについて</Heading>
                  <Text>
                    2030年には、情報技術により民主主義のあり方はアップデートされており、一人ひとりの声が政治・行政に届き、適切に合意形成・政策反映されていくような社会が当たり前になる──そんな未来を目指して立ち上げられたのがデジタル民主主義2030プロジェクトです。
                    AIやデジタル技術の進化により、これまで不可能だった新しい形の市民参加や政策運営が可能になるはずだという信念に基づいています。
                  </Text>
                  <Link
                    href={'https://note.com/annotakahiro24/n/na0e296bc30b8'}
                    target={'_blank'}
                    rel={'noreferrer noopener'}
                  >
                    <HStack justify={'center'} mt={2}>
                      <Text className={'textLink'}>プロジェクトについての詳細はこちら</Text>
                      <ExternalLinkIcon/>
                    </HStack>
                  </Link>
                </Box>
                <Box mb={8} maxW={'700px'} mx={'auto'}>
                  <Heading size={'lg'} mb={2} textAlign={'center'}>免責</Heading>
                  <Text mb={2}>このレポートはデジタル民主主義2030プロジェクトが開発するオープンソースを利用して出力されています。<br />このレポート内容に関する質問や意見はレポート発行者へお問い合わせください。</Text>
                  <Text>LLM（大規模言語モデル）にはバイアスがあり、信頼できない結果を出すことが知られています。我々はこれらの問題を軽減するために積極的に取り組んでいますが、現段階では結果の保証はできません。重要な意思決定を行う際には、パイプラインの結果だけに依存せず、必ず結果を検証することをお勧めします。</Text>
                </Box>
                <Box mb={8} maxW={'700px'} mx={'auto'}>
                  <Heading size={'lg'} mb={2} textAlign={'center'}>謝辞</Heading>
                  <Text>このブロードリスニングは <a className={'textLink'} href={'https://ai.objectives.institute/'} target={'_blank'}>AI Objectives Institute</a> の {'Talk to the City'} を元に開発されました。</Text>
                </Box>
                <Box mb={8}>
                  <Heading size={'lg'} mb={2} textAlign={'center'}>ブロードリスニング開発チーム</Heading>
                  <Stack direction={'row'} flexWrap={'wrap'} justify={'center'}>
                    {members.map((member, i) => (
                      <Box key={i} mx={5}>
                        <Text fontWeight={'bold'}>{member.role}</Text>
                        <Text>{member.name}<Text ml={2} as={'span'} fontSize={'xs'}>{member.enName}</Text></Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <DrawerActionTrigger>
                  <Button variant={'outline'}>閉じる</Button>
                </DrawerActionTrigger>
              </DrawerBody>
            </DrawerContent>
          </DrawerRoot>
        </HStack>
      </Stack>
    </footer>
  )
}
