import { redis } from '@/lib/redis'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { content, type, expiry } = body

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        if (type === 'file' && content.length > 1024 * 1024) { // 1MB Limit for MVP
            return NextResponse.json({ error: 'File too large (Max 1MB)' }, { status: 413 })
        }

        const id = nanoid(10)

        // Default to 1 hour (3600s) if no expiry provided. 
        // If 'read-once' is handled by logic, we still want a max TTL just in case.
        // We will use the 'ex' (seconds) option for Redis.
        const ttl = expiry || 3600

        await redis.set(id, JSON.stringify({ content, type }), { ex: ttl })

        return NextResponse.json({ id })
    } catch (error) {
        console.error('Error in /api/create:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

