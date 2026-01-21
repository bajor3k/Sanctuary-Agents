'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';

export default function PdfGeneratorPage() {
    const [count, setCount] = useState<number>(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; filePaths?: string[] } | null>(null);



    const handleGenerate = async () => {
        if (count < 1 || count > 1000) {
            alert('Please enter a count between 1 and 1000');
            return;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const response = await fetch('/api/generate-pdfs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count }),
            });
            const data = await response.json();
            if (response.ok) {
                setResult({ success: true, message: data.message, filePaths: data.filePaths });
            } else {
                const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to generate PDFs');
                setResult({ success: false, message: errorMsg });
            }
            setIsGenerating(false);

        } catch (error) {
            setResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full p-8">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">PDF Generator</h1>

                </div>

                <div className="space-y-6 bg-card border rounded-lg p-6">

                    <div className="space-y-2">
                        <label htmlFor="count" className="text-sm font-medium">Number of PDFs to Generate</label>
                        <input
                            id="count"
                            type="number"
                            min="1"
                            max="1000"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter number (1-1000)"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating {count} PDFs...
                            </>
                        ) : (
                            <>
                                <FileText className="h-5 w-5" />
                                Generate {count} PDF{count !== 1 ? 's' : ''}
                            </>
                        )}
                    </button>

                    {result && (
                        <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200 dark:bg-green-950/30' : 'bg-red-50 border-red-200 dark:bg-red-950/30'}`}>
                            <div className="flex items-start gap-3">
                                {result.success ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                                <div>
                                    <p className="font-medium">{result.message}</p>
                                    {result.success && <p className="text-sm opacity-80 mt-1">Files saved to: /Users/bajor3k/Desktop/Orion Advisory/</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
