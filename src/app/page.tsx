"use client"

import { useState, useRef } from "react"
import { Camera, Upload, Sparkles, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AnalysisResult {
  faceShape: string
  faceShapeDescription: string
  bestHaircuts: Array<{
    name: string
    description: string
    why: string
  }>
  facialFeatures: {
    forehead: string
    jawline: string
    cheekbones: string
  }
  recommendations: string[]
  avoidStyles: string[]
  colorSuggestions: string[]
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: selectedImage }),
      })

      if (!response.ok) {
        throw new Error("Erro ao analisar imagem")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao analisar a imagem. Tente novamente.")
    } finally {
      setAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedImage(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Visagismo AI
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubra o corte de cabelo perfeito para você com análise profissional de visagismo
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!selectedImage ? (
            /* Upload Section */
            <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">Envie sua foto</CardTitle>
                <CardDescription className="text-base">
                  Tire uma selfie ou escolha uma foto do seu dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <Button
                    size="lg"
                    className="flex-1 h-32 flex-col gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-10 h-10" />
                    <span className="text-lg font-semibold">Tirar Foto</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-32 flex-col gap-3 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10" />
                    <span className="text-lg font-semibold">Escolher Arquivo</span>
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                  <p className="mb-2">📸 Dicas para melhor resultado:</p>
                  <ul className="text-left space-y-1">
                    <li>• Tire a foto de frente, com boa iluminação</li>
                    <li>• Mantenha o rosto visível e centralizado</li>
                    <li>• Evite acessórios que cubram o rosto</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Analysis Section */
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sua Foto</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetAnalysis}
                      className="hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <img
                      src={selectedImage}
                      alt="Sua foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!result && (
                    <Button
                      size="lg"
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      onClick={analyzeImage}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analisar Visagismo
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      Análise Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Face Shape */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        Formato do Rosto
                        <Badge className="bg-purple-600">{result.faceShape}</Badge>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {result.faceShapeDescription}
                      </p>
                    </div>

                    <Separator />

                    {/* Facial Features */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Características Faciais</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Testa:</span>
                          <span className="font-medium">{result.facialFeatures.forehead}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Maxilar:</span>
                          <span className="font-medium">{result.facialFeatures.jawline}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Maçãs do rosto:</span>
                          <span className="font-medium">{result.facialFeatures.cheekbones}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Best Haircuts */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Cortes Recomendados</h3>
                      <div className="space-y-4">
                        {result.bestHaircuts.map((haircut, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800"
                          >
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                              {index + 1}. {haircut.name}
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {haircut.description}
                            </p>
                            <p className="text-xs text-purple-700 dark:text-purple-300 italic">
                              💡 {haircut.why}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Color Suggestions */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Sugestões de Cor</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.colorSuggestions.map((color, index) => (
                          <Badge key={index} variant="outline" className="border-orange-300 dark:border-orange-700">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Recommendations */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-green-700 dark:text-green-400">
                        ✓ Recomendações
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Avoid Styles */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-red-700 dark:text-red-400">
                        ✗ Evite
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {result.avoidStyles.map((avoid, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{avoid}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-6"
                      onClick={resetAnalysis}
                    >
                      Analisar Outra Foto
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Análise profissional de visagismo com inteligência artificial</p>
          <p className="mt-1">Consulte sempre um profissional para resultados personalizados</p>
        </div>
      </div>
    </div>
  )
}
