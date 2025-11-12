import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não fornecida" },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em visagismo profissional. Analise a foto do rosto da pessoa e forneça uma análise COMPLETA e DETALHADA de visagismo.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com esta estrutura EXATA:

{
  "faceShape": "formato do rosto (oval, redondo, quadrado, triangular, diamante, retangular ou coração)",
  "faceShapeDescription": "descrição detalhada do formato do rosto em 2-3 frases",
  "bestHaircuts": [
    {
      "name": "nome do corte",
      "description": "descrição detalhada do corte",
      "why": "por que esse corte combina com esse formato de rosto"
    }
  ],
  "facialFeatures": {
    "forehead": "descrição (ampla, média, estreita)",
    "jawline": "descrição (marcado, suave, angular)",
    "cheekbones": "descrição (proeminentes, suaves, altos)"
  },
  "recommendations": [
    "recomendação específica 1",
    "recomendação específica 2",
    "recomendação específica 3"
  ],
  "avoidStyles": [
    "estilo a evitar 1 e por quê",
    "estilo a evitar 2 e por quê"
  ],
  "colorSuggestions": [
    "sugestão de cor 1",
    "sugestão de cor 2",
    "sugestão de cor 3"
  ]
}

IMPORTANTE:
- Forneça pelo menos 3 cortes recomendados em "bestHaircuts"
- Seja específico e profissional nas recomendações
- Use termos técnicos de cabeleireiro quando apropriado
- Considere o formato do rosto, características faciais e proporções
- Retorne APENAS o JSON, sem texto adicional`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analise esta foto e forneça uma consulta completa de visagismo profissional.",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("Resposta vazia da API")
    }

    // Parse JSON response
    const analysis = JSON.parse(content)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Erro ao analisar imagem:", error)
    return NextResponse.json(
      { error: "Erro ao processar análise. Tente novamente." },
      { status: 500 }
    )
  }
}
