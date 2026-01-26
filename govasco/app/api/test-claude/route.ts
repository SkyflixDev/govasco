import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Réponds juste "GoVasco fonctionne !" en une phrase courte.'
        }
      ]
    })

    const response = message.content[0]
    const text = response.type === 'text' ? response.text : 'Error'

    return NextResponse.json({
      success: true,
      response: text
    })
  } catch (error) {
    console.error('Claude API Error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}