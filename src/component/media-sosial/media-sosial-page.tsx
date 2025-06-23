"use client"

import React, { useState, useEffect } from "react"
import { 
  Instagram, 
  Share2, 
  ExternalLink, 
  Copy, 
  Loader2, 
  AlertCircle,
  Download
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface MediaSosial {
  id: number;
  twibbon_link: string;
  instagram_link: string;
  created_at: string;
  updated_at: string;
}

export default function MediaSosialPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaLinks, setMediaLinks] = useState<MediaSosial | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMediaLinks()
  }, [])

  const fetchMediaLinks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/media-sosial/latest`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `Failed to fetch media links: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.data) {
        setMediaLinks(data.data)
      } else {
        // No entries yet
        setMediaLinks(null)
      }
    } catch (error) {
      console.error('Error fetching media links:', error)
      setError(error instanceof Error ? error.message : "Gagal memuat data media sosial")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Berhasil disalin",
      description: `${description} berhasil disalin ke clipboard`,
    })
  }

  if (isLoading) {
    return (
      <div className="container py-16 mx-auto">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Memuat informasi media sosial...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-16 mx-auto">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!mediaLinks || (!mediaLinks.twibbon_link && !mediaLinks.instagram_link)) {
    return (
      <div className="container py-16 mx-auto">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Media Sosial Bersekolah</h2>
          <p className="text-gray-600 mb-8">Informasi media sosial belum tersedia saat ini.</p>
          <Button onClick={fetchMediaLinks} variant="outline">Coba Lagi</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-16 mx-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Media Sosial Bersekolah</h1>
        
        <div className="space-y-8">
          {mediaLinks.twibbon_link && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" /> 
                  Twibbon Bersekolah
                </CardTitle>
                <CardDescription>
                  Gunakan Twibbon ini untuk mendukung program Bersekolah
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md break-all font-mono text-sm mb-4">
                  {mediaLinks.twibbon_link}
                </div>
                
                <p className="text-gray-600 text-sm mb-6">
                  Klik tombol di bawah untuk membuka Twibbon atau menyalin link
                </p>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(mediaLinks.twibbon_link, "Link Twibbon")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Salin Link
                </Button>
                <Button 
                  onClick={() => window.open(mediaLinks.twibbon_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Buka Twibbon
                </Button>
              </CardFooter>
            </Card>
          )}

          {mediaLinks.instagram_link && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" /> 
                  Instagram Bersekolah
                </CardTitle>
                <CardDescription>
                  Ikuti Instagram resmi Bersekolah untuk update terbaru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md break-all font-mono text-sm mb-4">
                  {mediaLinks.instagram_link}
                </div>
                
                <p className="text-gray-600 text-sm mb-6">
                  Klik tombol di bawah untuk membuka Instagram atau menyalin link
                </p>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(mediaLinks.instagram_link, "Link Instagram")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Salin Link
                </Button>
                <Button 
                  onClick={() => window.open(mediaLinks.instagram_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Buka Instagram
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
