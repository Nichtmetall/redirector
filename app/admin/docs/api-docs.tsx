"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { AdminPageLayout } from "../components/admin-page-layout"

interface Parameter {
    name: string
    type: string
    description: string
    required: boolean
}

interface JsonResponse {
    type: "json"
    schema: Record<string, any>
}

interface RedirectResponse {
    type: "redirect"
    description: string
}

type Response = JsonResponse | RedirectResponse

interface RequestBody {
    type: "json"
    schema: Record<string, any>
}

interface Endpoint {
    method: string
    path: string
    description: string
    parameters?: Parameter[]
    requestBody?: RequestBody
    response: Response
}

const endpoints: Record<string, Endpoint[]> = {
    redirects: [
        {
            method: "GET",
            path: "/api/redirect/[kundenname]",
            description: "Leitet den Benutzer zur entsprechenden Ziel-URL weiter.",
            parameters: [
                {
                    name: "kundenname",
                    type: "string",
                    description: "Der eindeutige Name des Kunden",
                    required: true
                }
            ],
            response: {
                type: "redirect",
                description: "HTTP 302 Redirect zur Ziel-URL"
            }
        },
        {
            method: "GET",
            path: "/api/redirects",
            description: "Gibt eine Liste aller verfügbaren Redirects zurück.",
            response: {
                type: "json",
                schema: {
                    redirects: [
                        {
                            kundenname: "string",
                            targetUrl: "string",
                            active: "boolean"
                        }
                    ]
                }
            }
        },
        {
            method: "POST",
            path: "/api/admin/redirects",
            description: "Erstellt einen neuen Redirect.",
            requestBody: {
                type: "json",
                schema: {
                    kundenname: "string",
                    targetUrl: "string",
                    active: "boolean"
                }
            },
            response: {
                type: "json",
                schema: {
                    success: "boolean",
                    message: "string"
                }
            }
        },
        {
            method: "PUT",
            path: "/api/admin/redirects/[kundenname]",
            description: "Aktualisiert einen bestehenden Redirect.",
            parameters: [
                {
                    name: "kundenname",
                    type: "string",
                    description: "Der eindeutige Name des Kunden",
                    required: true
                }
            ],
            requestBody: {
                type: "json",
                schema: {
                    targetUrl: "string",
                    active: "boolean"
                }
            },
            response: {
                type: "json",
                schema: {
                    success: "boolean",
                    message: "string"
                }
            }
        },
        {
            method: "DELETE",
            path: "/api/admin/redirects/[kundenname]",
            description: "Löscht einen Redirect.",
            parameters: [
                {
                    name: "kundenname",
                    type: "string",
                    description: "Der eindeutige Name des Kunden",
                    required: true
                }
            ],
            response: {
                type: "json",
                schema: {
                    success: "boolean",
                    message: "string"
                }
            }
        }
    ],
    customers: [
        {
            method: "GET",
            path: "/api/customers",
            description: "Gibt eine Liste aller Kunden zurück.",
            response: {
                type: "json",
                schema: {
                    customers: [
                        {
                            id: "string",
                            name: "string",
                            email: "string",
                            createdAt: "string",
                            updatedAt: "string"
                        }
                    ]
                }
            }
        },
        {
            method: "GET",
            path: "/api/customers/[id]",
            description: "Gibt die Details eines spezifischen Kunden zurück.",
            parameters: [
                {
                    name: "id",
                    type: "string",
                    description: "Die eindeutige ID des Kunden",
                    required: true
                }
            ],
            response: {
                type: "json",
                schema: {
                    id: "string",
                    name: "string",
                    email: "string",
                    createdAt: "string",
                    updatedAt: "string"
                }
            }
        },
        {
            method: "POST",
            path: "/api/customers",
            description: "Erstellt einen neuen Kunden.",
            requestBody: {
                type: "json",
                schema: {
                    name: "string",
                    email: "string"
                }
            },
            response: {
                type: "json",
                schema: {
                    id: "string",
                    name: "string",
                    email: "string",
                    createdAt: "string",
                    updatedAt: "string"
                }
            }
        },
        {
            method: "PUT",
            path: "/api/customers/[id]",
            description: "Aktualisiert einen bestehenden Kunden.",
            parameters: [
                {
                    name: "id",
                    type: "string",
                    description: "Die eindeutige ID des Kunden",
                    required: true
                }
            ],
            requestBody: {
                type: "json",
                schema: {
                    name: "string",
                    email: "string"
                }
            },
            response: {
                type: "json",
                schema: {
                    id: "string",
                    name: "string",
                    email: "string",
                    createdAt: "string",
                    updatedAt: "string"
                }
            }
        },
        {
            method: "DELETE",
            path: "/api/customers/[id]",
            description: "Löscht einen Kunden.",
            parameters: [
                {
                    name: "id",
                    type: "string",
                    description: "Die eindeutige ID des Kunden",
                    required: true
                }
            ],
            response: {
                type: "json",
                schema: {
                    success: "boolean",
                    message: "string"
                }
            }
        }
    ]
}

export default function ApiDocs() {
    const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

    const copyToClipboard = async (text: string, endpointId: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedEndpoint(endpointId)
            setTimeout(() => setCopiedEndpoint(null), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <AdminPageLayout
            title="API Dokumentation"
            subtitle="Vollständige Übersicht aller verfügbaren API Endpoints"
        >
            <div className="space-y-8">
                {Object.entries(endpoints).map(([resource, resourceEndpoints]) => (
                    <section key={resource} className="space-y-4">
                        <h2 className="text-2xl font-semibold capitalize">{resource}</h2>

                        <Accordion type="single" collapsible className="w-full">
                            {resourceEndpoints.map((endpoint, index) => {
                                const endpointId = `${resource}-${index}`
                                const endpointUrl = `${window.location.origin}${endpoint.path}`

                                return (
                                    <AccordionItem key={index} value={endpointId}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${endpoint.method === "GET" ? "bg-blue-100 text-blue-800" :
                                                    endpoint.method === "POST" ? "bg-green-100 text-green-800" :
                                                        endpoint.method === "PUT" ? "bg-yellow-100 text-yellow-800" :
                                                            "bg-red-100 text-red-800"
                                                    }`}>
                                                    {endpoint.method}
                                                </span>
                                                <span className="font-mono">{endpoint.path}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <CardTitle>{endpoint.description}</CardTitle>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            copyToClipboard(endpointUrl, endpointId)
                                                        }}
                                                    >
                                                        {copiedEndpoint === endpointId ? (
                                                            <>
                                                                <Check className="h-4 w-4" />
                                                                Kopiert
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-4 w-4" />
                                                                Kopieren
                                                            </>
                                                        )}
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {endpoint.parameters && (
                                                        <div>
                                                            <h4 className="font-medium mb-2">Parameter:</h4>
                                                            <div className="bg-muted p-4 rounded-lg">
                                                                <ul className="space-y-2">
                                                                    {endpoint.parameters.map((param, i) => (
                                                                        <li key={i} className="flex items-start gap-2">
                                                                            <span className="font-mono text-sm">{param.name}</span>
                                                                            <span className="text-sm text-muted-foreground">({param.type})</span>
                                                                            <span className="text-sm">- {param.description}</span>
                                                                            {param.required && (
                                                                                <span className="text-sm text-red-500">*</span>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {endpoint.requestBody && (
                                                        <div>
                                                            <h4 className="font-medium mb-2">Request Body:</h4>
                                                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                                                {JSON.stringify(endpoint.requestBody.schema, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}

                                                    {endpoint.response && (
                                                        <div>
                                                            <h4 className="font-medium mb-2">Response:</h4>
                                                            {endpoint.response.type === "json" ? (
                                                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                                                    {JSON.stringify(endpoint.response.schema, null, 2)}
                                                                </pre>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">{endpoint.response.description}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </section>
                ))}
            </div>
        </AdminPageLayout>
    )
} 