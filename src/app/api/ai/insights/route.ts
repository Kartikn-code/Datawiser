import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { datasetContext } = await req.json()

    if (!datasetContext) {
      return NextResponse.json({ error: 'Dataset context is required' }, { status: 400 })
    }

    const systemPrompt = `Analyze the provided dataset sample and its headers.
Generate 3 short, bulleted actionable business insights or notable patterns.
Keep them strictly under 15 words each. Do not use markdown headers, just return a string with 3 clearly separated sentences.
Dataset Name: ${datasetContext.name}
Headers: ${datasetContext.headers.join(', ')}
Sample: ${JSON.stringify(datasetContext.data, null, 2)}`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0.3,
      max_tokens: 150,
    })

    return NextResponse.json({ insights: response.choices[0].message.content })

  } catch (error: any) {
    console.error('OpenAI Error:', error)
    return NextResponse.json({ error: error.message || 'An error occurred with the AI.' }, { status: 500 })
  }
}
