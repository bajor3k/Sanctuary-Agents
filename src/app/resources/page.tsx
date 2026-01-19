
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cloud, FileText, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  const resources = [
    {
      title: "OneDrive Procedures",
      description: "Access shared company files and standard operating procedures.",
      icon: <FileText className="h-6 w-6 text-emerald-500" />,
      href: "/resources/onedrive",
    },
    {
      title: "External Tools",
      description: "Links to third-party tools and external portals.",
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      href: "/resources/external",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          Central hub for documents, procedures, and external tools.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Link key={resource.title} href={resource.href} className="block group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {resource.title}
                </CardTitle>
                {resource.icon}
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {resource.description}
                </CardDescription>
                <div className="flex items-center text-sm text-primary font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Open {resource.title} <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
