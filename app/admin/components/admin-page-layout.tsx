import React from "react"

interface AdminPageLayoutProps {
    title: string
    subtitle?: string
    children: React.ReactNode
}

export function AdminPageLayout({ title, subtitle, children }: AdminPageLayoutProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{title}</h1>
                {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
            </div>

            <div>
                {children}
            </div>
        </div>
    )
} 