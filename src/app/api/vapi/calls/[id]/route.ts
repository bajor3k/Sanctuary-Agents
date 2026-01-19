import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const privateKey = process.env.VAPI_PRIVATE_KEY;

    if (!privateKey) {
        return NextResponse.json({ error: 'VAPI_PRIVATE_KEY is not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(`https://api.vapi.ai/call/${id}`, {
            headers: {
                'Authorization': `Bearer ${privateKey}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch call status' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching call status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
