'use client'

import Link from 'next/link'
import {Header} from '@/components/Header'
import {
  Box,
  Button,
  Field,
  Heading,
  HStack,
  Input,
  NativeSelect,
  Presence,
  Textarea,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import {FileUploadDropzone, FileUploadList, FileUploadRoot} from '@/components/ui/file-upload'
import {useState} from 'react'
import {StepperInput} from '@/components/ui/stepper-input'
import {parseCsv} from '@/app/create/parseCsv'
import {useRouter} from 'next/navigation'
import {toaster} from '@/components/ui/toaster'
import {extractionPrompt} from './extractionPrompt'
import {initialLabellingPrompt} from '@/app/create/initialLabellingPrompt'
import {mergeLabellingPrompt} from '@/app/create/mergeLabellingPrompt'
import {overviewPrompt} from '@/app/create/overviewPrompt'
import {ChevronRightIcon, DownloadIcon} from 'lucide-react'
import {v4} from 'uuid'

export default function Page() {
  const router = useRouter()
  const {open, onToggle} = useDisclosure()
  const [loading, setLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>(v4())
  const [question, setQuestion] = useState<string>('')
  const [intro, setIntro] = useState<string>('')
  const [csv, setCsv] = useState<File | null>(null)
  const [model, setModel] = useState<string>('gpt-4o-mini')
  const [clusterLv1, setClusterLv1] = useState<number>(5)
  const [clusterLv2, setClusterLv2] = useState<number>(50)
  const [extraction, setExtraction] = useState<string>(extractionPrompt)
  const [initialLabelling, setInitialLabelling] = useState<string>(initialLabellingPrompt)
  const [mergeLabelling, setMergeLabelling] = useState<string>(mergeLabellingPrompt)
  const [overview, setOverview] = useState<string>(overviewPrompt)

  async function onSubmit() {
    setLoading(true)
    const precheck = [
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(input),
      question.length > 0,
      intro.length > 0,
      clusterLv1 > 0,
      clusterLv2 > 0,
      model.length > 0,
      extraction.length > 0,
      !!csv
    ].every(Boolean)
    if (!precheck) {
      toaster.create({
        // placement: 'bottom',
        type: 'error',
        title: '入力エラー',
        description: '全ての項目が入力されているか確認してください',
      })
      setLoading(false)
      return
    }
    let comments = []
    try {
      comments = await parseCsv(csv!)
    } catch (e) {
      toaster.create({
        type: 'error',
        title: 'CSVファイルの読み込みに失敗しました',
        description: e as string,
      })
      setLoading(false)
      return
    }
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASEPATH + '/admin/reports', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input,
          question,
          intro,
          comments,
          cluster: [clusterLv1, clusterLv2],
          model,
          prompt: {
            extraction,
            initialLabelling,
            mergeLabelling,
            overview
          }
        })
      })
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      toaster.create({
        duration: 5000,
        type: 'success',
        title: 'レポート作成を開始しました',
        description: '処理状況はダッシュボードを更新して確認してください',
      })
      router.replace('/')
    } catch (e) {
      console.error(e)
      toaster.create({
        duration: 5000,
        type: 'error',
        title: 'レポート作成に失敗しました',
        description: '問題が解決しない場合は開発者に問い合わせください',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={'container'}>
      <Header/>
      <Box mx={'auto'} maxW={'800px'}>
        <Heading textAlign={'center'} my={10}>新しいレポートを作成する</Heading>
        <VStack gap={5}>
          <Field.Root>
            <Field.Label>タイトル</Field.Label>
            <Input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="例：人類が人工知能を開発・展開する上で、最優先すべき課題は何でしょうか？"
            />
            <Field.HelperText>レポートのタイトルを記載します</Field.HelperText>
          </Field.Root>
          <Field.Root>
            <Field.Label>調査概要</Field.Label>
            <Input
              value={intro}
              onChange={e => setIntro(e.target.value)}
              placeholder="例：このAI生成レポートは、パブリックコメントにおいて寄せられた意見に基づいています。"
            />
            <Field.HelperText>コメントの集計期間や、コメントの収集元など、調査の概要を記載します</Field.HelperText>
          </Field.Root>
          <Field.Root>
            <Field.Label>
              コメントファイル
              <Link href="/sample_comments.csv"
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: '8px',
                  textDecoration: 'underline',
                  fontSize: '0.8rem',
                }}
              >
                <DownloadIcon size={14} />
                サンプルCSV
              </Link>
            </Field.Label>
            <VStack alignItems="stretch" w="full">
              <FileUploadRoot
                w={'full'}
                alignItems="stretch"
                accept={['text/csv']}
                onFileChange={(e) => setCsv(e.acceptedFiles[0])}
              >
                <FileUploadDropzone
                  label="分析するコメントファイルを選択してください"
                  description=".csv"
                />
                <FileUploadList/>
              </FileUploadRoot>
              <Field.HelperText>カラムに<b>&quot;comment&quot;</b>を含むCSVファイルが必要です(それ以外のカラムは無視されます)</Field.HelperText>
            </VStack>
          </Field.Root>
          <HStack justify={'flex-end'} w={'full'}>
            <Button onClick={onToggle} variant={'outline'} w={'200px'}>
              AI詳細設定 (オプション)
            </Button>
          </HStack>
          <Presence present={open} w={'full'}>
            <VStack gap={10}>
              <Field.Root>
                <Field.Label>ID</Field.Label>
                <Input
                  w={'40%'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="例：example"
                />
                <Field.HelperText>英字小文字と数字とハイフンのみ(URLで利用されます)</Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>クラスター数</Field.Label>
                <HStack>
                  <StepperInput
                    value={clusterLv1.toString()}
                    min={2}
                    max={10}
                    onValueChange={(e) => {
                      const v = Number(e.value)
                      setClusterLv1(v)
                    }}
                  />
                  <ChevronRightIcon/>
                  <StepperInput
                    value={clusterLv2.toString()}
                    min={2}
                    max={1000}
                    onValueChange={(e) => {
                      const v = Number(e.value)
                      setClusterLv2(v)
                    }}
                  />
                </HStack>
                <Field.HelperText>
                  階層ごとのクラスタ生成数です
                </Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>AIモデル</Field.Label>
                <NativeSelect.Root w={'40%'}>
                  <NativeSelect.Field value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value={'gpt-4o-mini'}>OpenAI GPT-4o mini</option>
                    <option value={'gpt-4o'}>OpenAI GPT-4o</option>
                    <option value={'o3-mini'}>OpenAI o3-mini</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator/>
                </NativeSelect.Root>
                <Field.HelperText>
                  {model === 'gpt-4o-mini' && 'GPT-4o mini：最も安価に利用できるモデルです。価格の詳細はOpenAIが公開しているAPI料金のページをご参照ください。'}
                  {model === 'gpt-4o' && 'GPT-4o：gpt-4o-miniと比較して高性能なモデルです。性能は高くなりますが、gpt-4o-miniと比較してOpenAI APIの料金は高くなります。'}
                  {model === 'o3-mini' && 'o3-mini：gpt-4oよりも高度な推論能力を備えたモデルです。性能はより高くなりますが、gpt-4oと比較してOpenAI APIの料金は高くなります。'}
                </Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>抽出プロンプト</Field.Label>
                <Textarea
                  h={'150px'}
                  value={extraction}
                  onChange={(e) => setExtraction(e.target.value)}
                />
                <Field.HelperText>
                  AIに提示する抽出プロンプトです(通常は変更不要です)
                </Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>初期ラベリングプロンプト</Field.Label>
                <Textarea
                  h={'150px'}
                  value={initialLabelling}
                  onChange={(e) => setInitialLabelling(e.target.value)}
                />
                <Field.HelperText>
                  AIに提示する初期ラベリングプロンプトです(通常は変更不要です)
                </Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>統合ラベリングプロンプト</Field.Label>
                <Textarea
                  h={'150px'}
                  value={mergeLabelling}
                  onChange={(e) => setMergeLabelling(e.target.value)}
                />
                <Field.HelperText>
                  AIに提示する統合ラベリングプロンプトです(通常は変更不要です)
                </Field.HelperText>
              </Field.Root>
              <Field.Root>
                <Field.Label>要約プロンプト</Field.Label>
                <Textarea
                  h={'150px'}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                />
                <Field.HelperText>
                  AIに提示する要約プロンプトです(通常は変更不要です)
                </Field.HelperText>
              </Field.Root>
            </VStack>
          </Presence>
          <Button
            mt={10}
            className={'gradientBg shadow'}
            size={'2xl'}
            w={'300px'}
            onClick={onSubmit}
            loading={loading}
          >レポート作成を開始</Button>
        </VStack>
      </Box>
    </div>
  )
}
