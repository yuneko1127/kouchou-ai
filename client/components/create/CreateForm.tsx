'use client'

import {Box, Button, Field, Heading, Input, NativeSelect, Textarea, VStack} from '@chakra-ui/react'
import {FileUploadDropzone, FileUploadList, FileUploadRoot} from '@/components/ui/file-upload'
import {useState} from 'react'

export function CreateForm() {
  const [input, setInput] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [intro, setIntro] = useState<string>('')
  const [_csv, setCsv] = useState<File | null>(null)
  const [model, setModel] = useState<string>('gpt-4o')
  const [prompt, setPrompt] = useState<string>('あなたは専門的なリサーチアシスタントで、整理された議論のデータセットを作成するお手伝いをする役割です。人工知能に関する公開協議を実施した状況を想定しています。一般市民から寄せられた議論の例を提示しますので、それらをより簡潔で読みやすい形に整理するお手伝いをお願いします。必要な場合は2つの別個の議論に分割することもできますが、多くの場合は1つの議論にまとめる方が望ましいでしょう。結果は整形されたJSON形式の文字列リストとして返してください。要約は必ず日本語で作成してください。')

  return (
    <Box mx={'auto'} maxW={'800px'}>
      <Heading textAlign={'center'} mb={10}>新しいレポートを作成する</Heading>
      <VStack gap={5}>
        <Field.Root>
          <Field.Label>ID</Field.Label>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="例：example"
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>タイトル</Field.Label>
          <Input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="例：人類が人工知能を開発・展開する上で、最優先すべき課題は何でしょうか？"
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>調査概要</Field.Label>
          <Input
            value={intro}
            onChange={e => setIntro(e.target.value)}
            placeholder="例：このAI生成レポートは、パブリックコメントにおいて寄せられた意見に基づいています。"
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>コメントファイル</Field.Label>
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
            <FileUploadList />
          </FileUploadRoot>
        </Field.Root>
        <Field.Root>
          <Field.Label>AIモデル</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field value={model} onChange={(e) => setModel(e.target.value)}>
              <option value={'gpt-4o'}>OpenAI ChatGPT 4o</option>
              <option value={'o3-mini-high'}>OpenAI ChatGPT o3-mini-high</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>プロンプト</Field.Label>
          <Textarea
            h={'150px'}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </Field.Root>
        <Button mt={10} className={'gradientBg shadow'} size={'2xl'} w={'300px'}>レポート作成を開始</Button>
      </VStack>
    </Box>
  )
}
