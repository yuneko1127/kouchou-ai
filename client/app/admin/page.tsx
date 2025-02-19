import {Header} from '@/components/Header'
import {Footer} from '@/components/Footer'
import {Meta, Report} from '@/type'
import {Alert, Box, Button, Card, Heading, HStack, Text} from '@chakra-ui/react'
import Link from 'next/link'
import {CircleCheckIcon, CircleFadingArrowUpIcon, EllipsisIcon, ExternalLinkIcon} from 'lucide-react'
import {MenuContent, MenuItem, MenuRoot, MenuTrigger} from '@/components/ui/menu'

export default async function Page() {
  const metaResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/meta/metadata.json')
  const reportsResponse = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/reports')
  if (!metaResponse.ok || !reportsResponse.ok) {
    return <p>エラー：サーバーサイドレンダリングに失敗しました</p>
  }
  const meta: Meta = await metaResponse.json()
  const reports: Report[] = await reportsResponse.json()
  return (
    <>
      <div className={'container'}>
        <Header meta={meta} />
        <Box mx={'auto'} maxW={'1000px'} mb={5}>
          <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Admin Dashboard</Heading>
          <Alert.Root status="warning" mb={10}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title fontSize={'md'}>注意</Alert.Title>
              <Alert.Description>
                このページはレポート作成者向けの管理画面です<br />
                <b>/admin</b> 以下の URL は管理者以外がアクセスできないように設定することを強く推奨します
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Heading textAlign={'center'} fontSize={'xl'} mb={5}>Reports</Heading>
          {reports.map(report => (
            <Card.Root
              size="md"
              key={report.slug}
              mb={4}
              borderLeftWidth={10}
              borderLeftColor={report.status === 'ready' ? 'green' : 'gray'}
            >
              <Card.Body>
                <HStack justify={'space-between'}>
                  <HStack>
                    <Box mr={3} color={report.status === 'ready' ? 'green' : 'gray'}>
                      {report.status === 'ready' ? (<CircleCheckIcon size={30} />) : (<CircleFadingArrowUpIcon size={30} />)}
                    </Box>
                    <Box>
                      <Card.Title>
                        <Text
                          fontSize={'md'}
                          color={report.status === 'ready' ? '#2577b1' : 'gray'}
                        >{report.title}</Text>
                      </Card.Title>
                      <Card.Description>
                        /reports/{report.slug}
                      </Card.Description>
                    </Box>
                  </HStack>
                  <HStack>
                    {report.status === 'ready' && (
                      <Link href={`/reports/${report.slug}`}>
                        <Button variant={'ghost'}>
                          <ExternalLinkIcon />
                        </Button>
                      </Link>
                    )}
                    <MenuRoot>
                      <MenuTrigger asChild>
                        <Button variant="ghost" size="lg">
                          <EllipsisIcon />
                        </Button>
                      </MenuTrigger>
                      <MenuContent>
                        <MenuItem
                          value="delete"
                          color="fg.error"
                        >
                          レポートを削除する(開発中)
                        </MenuItem>
                      </MenuContent>
                    </MenuRoot>
                  </HStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
          <HStack justify={'center'} mt={10}>
            <Link href={'/admin/create'}>
              <Button size={'xl'}>新しいレポートを作成する</Button>
            </Link>
          </HStack>
        </Box>
      </div>
      <Footer meta={meta} />
    </>
  )
}
