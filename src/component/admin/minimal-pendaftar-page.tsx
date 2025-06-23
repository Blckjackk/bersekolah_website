"use client";

import React, { useState } from "react";

export default function MinimalPendaftarPage() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-6" data-react-component="minimal-pendaftar">
      <h2 className="mb-4 text-2xl font-bold">Komponen React Minimal</h2>
      <p className="mb-4">Ini adalah komponen React minimal untuk menguji rendering.</p>
      
      <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="mb-2">Counter: <span className="font-bold">{count}</span></p>
        <button 
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={() => setCount(count + 1)}
        >
          Tambah Counter
        </button>
      </div>
      
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-700">
          Jika Anda dapat melihat tombol di atas dan mengekliknya untuk menambah counter, 
          berarti komponen React berhasil dirender.
        </p>
      </div>
    </div>
  );
}
