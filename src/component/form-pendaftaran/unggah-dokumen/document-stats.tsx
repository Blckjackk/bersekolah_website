import React from 'react';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentStatsProps {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  notUploaded: number;
}

export function DocumentStats({ total, pending, verified, rejected, notUploaded }: DocumentStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <h3 className="text-xl font-bold">{total}</h3>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Belum Diunggah</p>
              <h3 className="text-xl font-bold text-gray-600">{notUploaded}</h3>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Menunggu</p>
              <h3 className="text-xl font-bold text-yellow-600">{pending}</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Terverifikasi</p>
              <h3 className="text-xl font-bold text-green-600">{verified}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ditolak</p>
              <h3 className="text-xl font-bold text-red-600">{rejected}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
