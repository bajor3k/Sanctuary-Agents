import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { customerNumber, assistantId, squad } = await req.json();

        const privateKey = process.env.VAPI_PRIVATE_KEY;
        const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

        if (!privateKey) {
            return NextResponse.json({ error: 'VAPI_PRIVATE_KEY is not configured' }, { status: 500 });
        }

        if (!phoneNumberId) {
            return NextResponse.json({ error: 'VAPI_PHONE_NUMBER_ID is not configured' }, { status: 500 });
        }

        if (!customerNumber) {
            return NextResponse.json({ error: 'Customer number is required' }, { status: 400 });
        }

        // Simple E.164 formatting (assuming US for now)
        let formattedNumber = customerNumber.replace(/\D/g, ''); // Remove non-digits
        if (formattedNumber.length === 10) {
            formattedNumber = `+1${formattedNumber}`;
        } else if (formattedNumber.length > 10 && !customerNumber.startsWith('+')) {
            formattedNumber = `+${formattedNumber}`;
        } else if (customerNumber.startsWith('+')) {
            formattedNumber = customerNumber; // Assume already valid if it starts with +
        } else {
            // Fallback or handle invalid
            console.warn("Phone number might be invalid:", customerNumber);
        }

        const payload: any = {
            customer: {
                number: formattedNumber,
            },
            phoneNumberId: phoneNumberId,
        };

        // If squad is provided, use it (overrides assistantId)
        if (squad) {
            payload.squad = squad;
        } else if (assistantId) {
            payload.assistantId = assistantId;
        } else {
            // Fallback to env assistant ID if neither is provided
            const envAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
            if (envAssistantId) {
                payload.assistantId = envAssistantId;
            } else {
                return NextResponse.json({ error: 'No assistantId or squad provided' }, { status: 400 });
            }
        }

        const response = await fetch('https://api.vapi.ai/call/phone', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${privateKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Vapi Call Error:', response.status, errorData);
            return NextResponse.json({ error: 'Failed to initiate call', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error initiating call:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
