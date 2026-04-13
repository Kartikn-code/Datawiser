import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Helper to generate a statistical summary of the dataset
function generateDatasetSummary(data: any[], headers: string[]) {
  const summary: any = {}
  const rowCount = data.length

  headers.forEach(header => {
    // Collect non-null values
    const values = data.map(row => row[header]).filter(v => v !== null && v !== undefined && v !== '')
    
    if (values.length === 0) return

    // Check if it's primarily numeric
    const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v))
    
    if (numericValues.length > values.length * 0.8) {
      // Numerical summary
      const sum = numericValues.reduce((a, b) => a + b, 0)
      const avg = sum / numericValues.length
      const min = Math.min(...numericValues)
      const max = Math.max(...numericValues)
      summary[header] = {
        type: 'numeric',
        total_sum: sum.toFixed(2),
        average: avg.toFixed(2),
        min,
        max,
        sample_count: numericValues.length
      }
    } else {
      // Categorical summary
      const counts: any = {}
      values.forEach(v => {
        const strV = String(v).slice(0, 50) // truncate long strings
        counts[strV] = (counts[strV] || 0) + 1
      })
      
      const uniqueCount = Object.keys(counts).length
      const sortedValues = Object.entries(counts)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([val, count]) => `${val} (${count})`)
      
      summary[header] = {
        type: 'categorical',
        unique_values_count: uniqueCount,
        top_5_values: sortedValues
      }
    }
  })

  return {
    total_rows: rowCount,
    column_summaries: summary
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, datasetContext } = await req.json()

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        role: 'assistant',
        content: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file. You can get a free key at https://aistudio.google.com/apikey'
      })
    }

    // Construct the system prompt
    let systemPrompt = `You are a helpful Data Analyst Assistant. Your goal is to help the user understand their business data. You give concise, plain-English answers without deep technical jargon unless asked. 
    Use **bold** formatting (e.g. **$1,234.56**) for all key numbers, totals, or important metrics to make them stand out.`

    if (datasetContext) {
      const fullData = datasetContext.data || []
      const headers = datasetContext.headers || []
      
      // 1. Generate a statistical summary of the ENTIRE provided context (up to 5000 rows)
      const statsSummary = generateDatasetSummary(fullData, headers)
      
      // 2. Take a small raw sample for "look and feel"
      const rawSample = fullData.slice(0, 25)
      
      systemPrompt += `\n\nDataset Name: "${datasetContext.name}"`
      systemPrompt += `\nTotal Rows In Dataset: ${statsSummary.total_rows}`
      systemPrompt += `\n\nSTATISTICAL SUMMARY (All Rows):`
      systemPrompt += `\n${JSON.stringify(statsSummary.column_summaries, null, 2)}`
      systemPrompt += `\n\nRAW SAMPLE (First 25 Rows Only):`
      systemPrompt += `\n${JSON.stringify(rawSample)}`
      systemPrompt += `\n\nIMPORTANT: Use the Statistical Summary to answer questions about totals, averages, or counts across the whole dataset correctly.`
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt,
    })

    // Convert message history to Gemini format
    const allHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const firstUserIdx = allHistory.findIndex((m: any) => m.role === 'user')
    const history = firstUserIdx === -1 ? [] : allHistory.slice(firstUserIdx)

    const chat = model.startChat({ history })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response

    return NextResponse.json({
      role: 'assistant',
      content: response.text()
    })

  } catch (error: any) {
    console.error('Gemini Error:', error)
    const msg = error?.message?.toLowerCase() || ''
    const isRateLimit = error?.status === 429 || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('rate limit')

    if (isRateLimit) {
      return NextResponse.json({
        role: 'assistant',
        content: 'The Gemini API is currently busy. Please wait a moment and try again.'
      })
    }
    return NextResponse.json({ error: error.message || 'An error occurred with the AI.' }, { status: 500 })
  }
}
