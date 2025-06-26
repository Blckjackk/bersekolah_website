"use client";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <div className="max-w-3xl">
        <img
          src="/ImageTemp/404 Not Found.jpg"
          alt="404 - Halaman Tidak Ditemukan"
          className="mx-auto mb-8 max-w-full h-auto rounded-lg shadow-lg"
          width={500}
          height={400}
        />

        <h1 className="mb-4 text-4xl font-bold text-primary md:text-5xl">
          Halaman Tidak Ditemukan
        </h1>

        <p className="mb-8 text-lg text-muted-foreground">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          Silakan kembali ke halaman utama atau hubungi kami jika Anda memerlukan bantuan.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/">
            <Button variant="default" className="gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Kembali ke Beranda
            </Button>
          </a>
          <a href="/kontak">
            <Button variant="outline" className="gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Hubungi Kami
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
