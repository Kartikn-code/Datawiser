import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { datasetContext } = await req.json()

    if (!datasetContext) {
      return NextResponse.json({ error: 'Dataset context is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ insights: 'AI insights unavailable — please add GEMINI_API_KEY to .env.local. Get a free key at https://aistudio.google.com/apikey' })
    }

    const prompt = `Analyze the provided dataset sample and its headers.
Generate 3 short, bulleted actionable business insights or notable patterns.
Keep them strictly under 15 words each. Do not use markdown headers, just return a string with 3 clearly separated sentences.
Dataset Name: ${datasetContext.name}
Headers: ${datasetContext.headers.join(', ')}
Sample: ${JSON.stringify((datasetContext.data || []).slice(0, 10))}`

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    const result = await model.generateContent(prompt)
    const response = result.response

    return NextResponse.json({ insights: response.text() })

  } catch (error: any) {
    console.error('Gemini Insights Error:', error)
    return NextResponse.json({ error: error.message || 'An error occurred with the AI.' }, { status: 500 })
  }
}
