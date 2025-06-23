"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, Save, Loader2 } from "lucide-react"
import ApiConfig from "@/lib/config/api-config"

export default function ApiConfigPage() {
	const [apiUrl, setApiUrl] = useState('')
	const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [testMessage, setTestMessage] = useState('')
	const [isSaving, setIsSaving] = useState(false)
	const [saveMessage, setSaveMessage] = useState('')
	
	// Load the current API URL from environment or config
	useEffect(() => {
		setApiUrl(ApiConfig.baseURL)
	}, [])
	
	// Test the API connection
	const testConnection = async () => {
		setTestStatus('loading')
		setTestMessage('')
		
		try {
			// Try to fetch from the announcements endpoint
			const response = await fetch(`${apiUrl}/announcements`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				}
			})
			
			if (response.ok) {
				setTestStatus('success')
				setTestMessage('Koneksi ke database berhasil! API endpoint merespons dengan benar.')
				
				// Check if we actually got announcements data
				const data = await response.json()
				if (data && ((data.data && data.data.length > 0) || (Array.isArray(data) && data.length > 0))) {
					setTestMessage('Koneksi ke database berhasil! ' + 
					  (data.data?.length || (Array.isArray(data) ? data.length : 0)) + 
					  ' pengumuman ditemukan.')
				} else {
					setTestMessage('Koneksi ke database berhasil, tetapi tidak ada data pengumuman yang tersedia.')
				}
			} else {
				setTestStatus('error')
				setTestMessage(`Koneksi gagal dengan status: ${response.status} ${response.statusText}`)
			}
		} catch (error) {
			setTestStatus('error')
			setTestMessage(`Error koneksi: ${error instanceof Error ? error.message : String(error)}`)
		}
	}
	
	// Save the API configuration
	const saveConfig = async () => {
		setIsSaving(true)
		setSaveMessage('')
		
		try {
			// In a real application, you would save this to a configuration file or database
			// Here we're just simulating that by setting a localStorage value
			localStorage.setItem('bersekolah_api_url', apiUrl)
			
			// Simulate API save delay
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			setSaveMessage('Konfigurasi berhasil disimpan. Halaman akan dimuat ulang dalam 2 detik.')
			
			// Reload after a delay to apply new settings
			setTimeout(() => {
				window.location.reload()
			}, 2000)
		} catch (error) {
			setSaveMessage(`Error menyimpan konfigurasi: ${error instanceof Error ? error.message : String(error)}`)
		} finally {
			setIsSaving(false)
		}
	}
	
	return (
		<div className="container py-12 mx-auto">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="text-2xl">Konfigurasi API Database</CardTitle>
					<CardDescription>
						Atur pengaturan koneksi ke API server dan database
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="api-url">URL API Server</Label>
						<Input
							id="api-url"
							value={apiUrl}
							onChange={(e) => setApiUrl(e.target.value)}
							placeholder="http://localhost:8000/api"
							className="w-full"
						/>
						<p className="text-sm text-muted-foreground">
							URL dasar untuk API Laravel, misalnya http://localhost:8000/api atau https://api.bersekolah.com/api
						</p>
					</div>
					
					{/* Test connection results */}
					{testStatus !== 'idle' && (
						<div className={`p-4 border rounded-md ${
							testStatus === 'success' ? 'bg-green-50 border-green-200' : 
							testStatus === 'error' ? 'bg-red-50 border-red-200' : 
							'bg-blue-50 border-blue-200'
						}`}>
							<div className="flex items-start gap-3">
								{testStatus === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
								{testStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
								{testStatus === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
								<div>
									<p className={`font-medium ${
										testStatus === 'success' ? 'text-green-700' : 
										testStatus === 'error' ? 'text-red-700' : 
										'text-blue-700'
									}`}>
										{testStatus === 'loading' ? 'Menguji koneksi...' : 
										testStatus === 'success' ? 'Koneksi Berhasil' : 
										'Koneksi Gagal'}
									</p>
									{testMessage && <p className="mt-1 text-sm">{testMessage}</p>}
								</div>
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
					<Button 
						variant="outline" 
						onClick={testConnection}
						disabled={testStatus === 'loading' || !apiUrl}
					>
						{testStatus === 'loading' ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Menguji...
							</>
						) : 'Uji Koneksi'}
					</Button>
					
					<div className="flex flex-col items-end gap-2">
						{saveMessage && (
							<p className={`text-sm ${
								saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
							}`}>
								{saveMessage}
							</p>
						)}
						
						<Button 
							onClick={saveConfig}
							disabled={isSaving || !apiUrl}
						>
							{isSaving ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Menyimpan...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Simpan Konfigurasi
								</>
							)}
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	)
}
