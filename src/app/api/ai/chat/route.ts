import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, datasetContext } = await req.json()

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    // Construct the system prompt
    let systemPrompt = `You are a helpful Data Analyst Assistant. Your goal is to help the user understand their business data. You give concise, plain-English answers without deep technical jargon unless asked.`

    if (datasetContext) {
      systemPrompt += `\n\nHere is the context of the dataset the user is asking about:\n`
      systemPrompt += `Dataset Name: ${datasetContext.name}\n`
      systemPrompt += `Headers/Columns: ${datasetContext.headers.join(', ')}\n`
      systemPrompt += `\nHere is a sample of the data (first 50 rows max):\n`
      systemPrompt += JSON.stringify(datasetContext.data, null, 2)
      systemPrompt += `\n\nWhen answering questions, base your answers primarily on the dataset structure and data provided above.`
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or gpt-4o if preferred
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.2, // Low temperature for more factual responses
      max_tokens: 500,
    })

    return NextResponse.json({ 
      role: 'assistant', 
      content: response.choices[0].message.content 
    })

  } catch (error: any) {
    console.error('OpenAI Error:', error)
    if (error?.status === 429) {
      return NextResponse.json({ 
        role: 'assistant', 
        content: 'I apologize, but your OpenAI API key has exceeded its quota or billing limits (Error 429). Please check your plan at platform.openai.com. In the meantime, you can still use the local dashboards and CRM features!' 
      })
    }
    return NextResponse.json({ error: error.message || 'An error occurred with the AI.' }, { status: 500 })
  }
}
