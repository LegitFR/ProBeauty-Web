import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function convertToSubcurrency(amount: number) {
    return amount * 100
}

async function POST(request: NextRequest) {
    try {
        const {amount} = await request.json()
        const paymentIntent = await stripe.paymentIntents.create({
            amount: convertToSubcurrency(amount), // paise
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
        })
        return NextResponse.json({clientSecret: paymentIntent.client_secret})
    } catch (error: unknown) {
        console.error("Error creating payment intent:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}

export { POST }