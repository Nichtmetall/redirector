import { Metadata } from "next"
import ApiDocs from "./api-docs"

export const metadata: Metadata = {
    title: "API Dokumentation",
    description: "Dokumentation der verfügbaren API Endpoints",
}

export default function ApiDocsPage() {
    return <ApiDocs />
} 