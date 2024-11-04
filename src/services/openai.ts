import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function generateImage(prompt: string): Promise<string> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",  // Using DALL-E 3 for better reliability
      prompt: prompt,
      n: 1,
      size: "1024x1024",  // DALL-E 3 requires 1024x1024
      quality: "standard",
      response_format: "url"
    })

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL in response')
    }

    return response.data[0].url
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const message = error.message || 'OpenAI API error'
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type
      })
      throw new Error(`AI generation failed: ${message}`)
    }

    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your internet connection and try again')
    }

    throw new Error('Failed to generate image. Please try again.')
  }
}