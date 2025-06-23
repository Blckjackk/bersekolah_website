import React from 'react';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DocumentStatsProps {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  notUploaded?: number;
}

export function DocumentStats({ total, pending, verified, rejected, notUploaded }: DocumentStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Dokumen</p>
              <h3 className="text-2xl font-bold">{total}</h3>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Belum Diverifikasi</p>
              <h3 className="text-2xl font-bold">{pending}</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Terverifikasi</p>
              <h3 className="text-2xl font-bold">{verified}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ditolak</p>
              <h3 className="text-2xl font-bold">{rejected}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
