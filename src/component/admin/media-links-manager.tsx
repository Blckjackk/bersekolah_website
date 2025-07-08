"use client"

import React, { useState, useEffect } from "react"
import { 
  Save, 
  Link, 
  Instagram, 
  Share2, 
  ExternalLink, 
  Copy, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  MessageCircle,
  Phone
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MediaSosial {
  id: number;
  twibbon_link: string;
  instagram_link: string;
  link_grup_beasiswa: string;
  whatsapp_number: string;
  created_at: string;
  updated_at: string;
}

export function MediaLinksManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaLinks, setMediaLinks] = useState<MediaSosial | null>(null)
  const [twibbonLink, setTwibbonLink] = useState("")
  const [instagramLink, setInstagramLink] = useState("")
  const [whatsappGroupLink, setWhatsappGroupLink] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchMediaLinks()
  }, [])

  const fetchMediaLinks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('Token autentikasi tidak ditemukan')      // First try to get the latest entry
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/media-sosial/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `Failed to fetch media links: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.data && data.data.id) {
        // Use the latest entry
        const latestEntry = data.data
        console.log('Found existing media links:', latestEntry)
        setMediaLinks(latestEntry)
        setTwibbonLink(latestEntry.twibbon_link || "")
        setInstagramLink(latestEntry.instagram_link || "")
        setWhatsappGroupLink(latestEntry.link_grup_beasiswa || "")
        setWhatsappNumber(latestEntry.whatsapp_number || "")
      } else {
        console.log('No existing media links found')
        // No entries yet
        setMediaLinks(null)
        setTwibbonLink("")
        setInstagramLink("")
        setWhatsappGroupLink("")
        setWhatsappNumber("")
      }
    } catch (error) {
      console.error('Error fetching media links:', error)
      setError(error instanceof Error ? error.message : "Gagal memuat data media sosial")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('bersekolah_auth_token')
      if (!token) throw new Error('Token autentikasi tidak ditemukan')

      // Validate URLs
      if (twibbonLink && !isValidUrl(twibbonLink)) {
        toast({
          title: "Format URL tidak valid",
          description: "URL Twibbon tidak valid. Pastikan diawali dengan http:// atau https://",
          variant: "destructive",
        })
        return
      }

      if (instagramLink && !isValidUrl(instagramLink)) {
        toast({
          title: "Format URL tidak valid",
          description: "URL Instagram tidak valid. Pastikan diawali dengan http:// atau https://",
          variant: "destructive",
        })
        return
      }

      if (whatsappGroupLink && !isValidUrl(whatsappGroupLink)) {
        toast({
          title: "Format URL tidak valid",
          description: "URL Grup WhatsApp tidak valid. Pastikan diawali dengan http:// atau https://",
          variant: "destructive",
        })
        return
      }      // Check if we're updating or creating
      const isUpdate = mediaLinks && mediaLinks.id;
      
      console.log(isUpdate ? `Updating media link ID: ${mediaLinks.id}` : 'Creating new media link');
      
      const method = isUpdate ? 'PUT' : 'POST';
      const endpoint = isUpdate
        ? `${import.meta.env.PUBLIC_API_BASE_URL}/admin/media-sosial/${mediaLinks.id}`
        : `${import.meta.env.PUBLIC_API_BASE_URL}/admin/media-sosial`;

      console.log(`Sending ${method} request to ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          twibbon_link: twibbonLink.trim() || null,
          instagram_link: instagramLink.trim() || null,
          link_grup_beasiswa: whatsappGroupLink.trim() || null,
          whatsapp_number: whatsappNumber.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `Failed to save: ${response.status}`)
      }

      const data = await response.json()
      console.log('Save response:', data);
      
      // Fetch the latest data to ensure we're in sync with the server
      await fetchMediaLinks();
      
      toast({
        title: "Berhasil disimpan",
        description: "Link media sosial berhasil diperbarui",
      })
      
    } catch (error) {
      console.error('Error saving media links:', error)
      toast({
        title: "Gagal menyimpan",
        description: error instanceof Error ? error.message : "Gagal menyimpan data media sosial",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Berhasil disalin",
      description: `${description} berhasil disalin ke clipboard`,
    })
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (error) {
      return false
    }
  }

  if (isLoading) {
    return (
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle>Media Sosial Bersekolah</CardTitle>
          <CardDescription>
            Kelola link Twibbon dan Instagram untuk disebarkan ke peserta
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle>Media Sosial Bersekolah</CardTitle>
          <CardDescription>
            Kelola link Twibbon dan Instagram untuk disebarkan ke peserta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchMediaLinks}>Coba Lagi</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <Share2 className="w-5 h-5" /> 
          Media Sosial & Kontak Bersekolah
        </CardTitle>
        <CardDescription>
          Kelola link media sosial dan kontak untuk disebarkan ke peserta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layout 2x2 Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* A - Twibbon */}
          <div className="space-y-2">
            <Label htmlFor="twibbon">
              <div className="flex gap-2 items-center">
                <Share2 className="w-4 h-4" /> Link Twibbon
              </div>
            </Label>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1">
                <Input
                  id="twibbon"
                  placeholder="https://example.com/twibbon"
                  value={twibbonLink}
                  onChange={(e) => setTwibbonLink(e.target.value)}
                />
              </div>
              {twibbonLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(twibbonLink, "Link Twibbon")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Salin ke clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {twibbonLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(twibbonLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Buka di tab baru</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Link Twibbon yang akan dibagikan kepada peserta
            </p>
          </div>

          {/* B - Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram">
              <div className="flex gap-2 items-center">
                <Instagram className="w-4 h-4" /> Link Instagram
              </div>
            </Label>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1">
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/bersekolah"
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                />
              </div>
              {instagramLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(instagramLink, "Link Instagram")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Salin ke clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {instagramLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(instagramLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Buka di tab baru</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Link Instagram Bersekolah yang akan dibagikan kepada peserta
            </p>
          </div>

          {/* C - WhatsApp Group */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp-group">
              <div className="flex gap-2 items-center">
                <MessageCircle className="w-4 h-4" /> Link Grup WhatsApp
              </div>
            </Label>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1">
                <Input
                  id="whatsapp-group"
                  placeholder="https://chat.whatsapp.com/..."
                  value={whatsappGroupLink}
                  onChange={(e) => setWhatsappGroupLink(e.target.value)}
                />
              </div>
              {whatsappGroupLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(whatsappGroupLink, "Link Grup WhatsApp")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Salin ke clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {whatsappGroupLink && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(whatsappGroupLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Buka di tab baru</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Link grup WhatsApp Bersekolah untuk peserta
            </p>
          </div>

          {/* D - WhatsApp Number */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp-number">
              <div className="flex gap-2 items-center">
                <Phone className="w-4 h-4" /> Nomor WhatsApp HUMAS
              </div>
            </Label>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1">
                <Input
                  id="whatsapp-number"
                  placeholder="+6281234567890"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
              </div>
              {whatsappNumber && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(whatsappNumber, "Nomor WhatsApp")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Salin ke clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {whatsappNumber && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank')}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Buka WhatsApp</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Nomor WhatsApp HUMAS Bersekolah untuk konsultasi
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 w-4 h-4" />
              Simpan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
