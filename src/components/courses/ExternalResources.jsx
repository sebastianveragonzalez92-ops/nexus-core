import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, Video, Link as LinkIcon, File } from 'lucide-react';

const typeIcons = {
  article: FileText,
  video: Video,
  document: File,
  link: LinkIcon,
};

const typeColors = {
  article: 'bg-blue-50 text-blue-700 border-blue-200',
  video: 'bg-red-50 text-red-700 border-red-200',
  document: 'bg-green-50 text-green-700 border-green-200',
  link: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function ExternalResources({ resources }) {
  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No hay recursos externos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos Externos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource, i) => {
          const Icon = typeIcons[resource.type] || LinkIcon;
          return (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-white">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {resource.title}
                </p>
                <Badge className={`mt-1 ${typeColors[resource.type]}`}>
                  {resource.type}
                </Badge>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}