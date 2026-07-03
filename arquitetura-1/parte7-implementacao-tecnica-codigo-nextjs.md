A. Tabelas Supabase (SQL)
```
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id TEXT NOT NULL, -- "ebook_llm_local"
  price_cents INTEGER, -- 4700 = R$47
  status TEXT DEFAULT 'pending', -- paid, refunded
  stripe_payment_id TEXT,
  downloaded BOOLEAN DEFAULT false,
  refund_window_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(stripe_payment_id)
);

-- Tokens (1:1 com Purchase)
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL, -- ABC123XYZ
  purchase_id UUID REFERENCES purchases(id),
  profile_id TEXT, -- dev_python_aia
  triaged BOOLEAN DEFAULT false,
  triaged_at TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Quiz Responses
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT REFERENCES tokens(token),
  question_id INTEGER,
  answer TEXT, -- JSON
  created_at TIMESTAMP DEFAULT now()
);

-- Profiles
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- dev_python_aia
  name TEXT,
  description TEXT,
  recommended_ebooks JSON, -- array
  study_roadmap JSON
);

-- Recommended Products
CREATE TABLE recommended_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id),
  product_id TEXT,
  "order" INTEGER,
  is_free BOOLEAN,
  email_day_trigger INTEGER
);
```

___
B. API Route: Checkout (Stripe)
```
// pages/api/checkout.ts
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { generateToken } from '@/lib/tokens'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function POST(req: any, res: any) {
  const { email, productId, priceInCents } = req.body

  try {
    // 1. Cria checkout session no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: getProductName(productId),
              description: `Acesso a ${productId}`
            },
            unit_amount: priceInCents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      customer_email: email,
      metadata: {
        productId,
        email
      }
    })

    res.json({ url: session.url })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
```
___
C. Webhook: Stripe Payment Success
```
// pages/api/webhooks/stripe.ts
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { generateToken } from '@/lib/tokens'

export const config = {
  api: {
    bodyParser: {
      raw: true
    }
  }
}

export default async function POST(req: any, res: any) {
  const sig = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { email, productId } = session.metadata

    // 1. Cria user (ou updates)
    const { data: user } = await supabase
      .from('users')
      .upsert({
        email,
        stripe_customer_id: session.customer
      })
      .select()

    // 2. Cria purchase
    const { data: purchase } = await supabase
      .from('purchases')
      .insert({
        user_id: user[0].id,
        product_id: productId,
        price_cents: session.amount_total,
        status: 'paid',
        stripe_payment_id: session.payment_intent,
        refund_window_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .select()

    // 3. Gera token único
    const token = generateToken() // ABC123XYZ
    await supabase.from('tokens').insert({
      token,
      purchase_id: purchase[0].id,
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
    })

    // 4. Envia email com token
    await sendEmail({
      to: email,
      subject: 'Seu Ebook + Token chegou! 🎉',
      template: 'purchase_confirmation',
      data: {
        token,
        quizUrl: `${process.env.NEXT_PUBLIC_URL}/quiz/${token}`
      }
    })

    res.json({ received: true })
  }

  res.json({ received: true })
}
```
___
D. Página: Quiz /quiz/[token].tsx
```
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'

export default function QuizPage() {
  const router = useRouter()
  const { token } = router.query
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)

  const quizQuestions = [ /* conforme mostrado acima */ ]

  const handleAnswer = (questionId, answer) => {
    setAnswers([...answers, { questionId, answer }])
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuiz()
    }
  }

  const submitQuiz = async () => {
    setLoading(true)
    
    // 1. Salva respostas
    for (const answer of answers) {
      await supabase.from('quiz_responses').insert({
        token,
        question_id: answer.questionId,
        answer: answer.answer
      })
    }

    // 2. Calcula perfil
    const calculatedProfile = calculateProfile(answers)
    
    // 3. Atualiza token com perfil
    await supabase
      .from('tokens')
      .update({
        profile_id: calculatedProfile,
        triaged: true,
        triaged_at: new Date()
      })
      .eq('token', token)

    // 4. Redireciona para dashboard
    router.push(`/dashboard/${token}?profile=${calculatedProfile}&new=true`)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Descobrir seu perfil de aprendizado
        </h1>
        <p className="text-gray-600">
          Pergunta {currentQuestion + 1} de {quizQuestions.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {quizQuestions[currentQuestion].text}
        </h2>

        <div className="space-y-3">
          {quizQuestions[currentQuestion].options.map((option) => (
            <button
              key={option.text}
              onClick={() => handleAnswer(quizQuestions[currentQuestion].id, option.text)}
              className="w-full p-3 text-left border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="mt-4 text-center">Calculando seu perfil...</div>}
    </div>
  )
}
```
___
E. Dashboard: /dashboard/[token].tsx
```
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const { token, profile, new: isNew } = router.query

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [token])

  const loadDashboard = async () => {
    // 1. Busca token info
    const { data: tokenData } = await supabase
      .from('tokens')
      .select('*, purchase:purchase_id(*, user:user_id(email))')
      .eq('token', token)
      .single()

    // 2. Busca profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', tokenData.profile_id)
      .single()

    // 3. Busca produtos recomendados
    const { data: products } = await supabase
      .from('recommended_products')
      .select('*')
      .eq('profile_id', tokenData.profile_id)
      .order('order')

    setData({
      token: tokenData,
      profile: profileData,
      products,
      user: tokenData.purchase.user
    })
    setLoading(false)
  }

  if (loading) return <div>Carregando dashboard...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      {isNew && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <h2 className="font-bold text-green-900">
            🎉 Seu perfil foi descoberto!
          </h2>
          <p className="text-green-800">
            {data.profile.description}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Roadmap */}
        <div>
          <h2 className="text-xl font-bold mb-4">Seu Roadmap</h2>
          <div className="space-y-4">
            {Object.entries(data.profile.study_roadmap).map(([week, content]) => (
              <div key={week} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">{content.title}</h3>
                <ul className="text-sm text-gray-600 mt-2">
                  {content.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Produtos Recomendados */}
        <div>
          <h2 className="text-xl font-bold mb-4">Seus Produtos</h2>
          <div className="space-y-3">
            {data.products.map((product, idx) => (
              <div
                key={product.id}
                className={`p-4 rounded-lg border-2 ${
                  product.is_free
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">#{idx + 1}</p>
                    <h3 className="font-semibold">
                      {getProductName(product.product_id)}
                    </h3>
                  </div>
                  {product.is_free && (
                    <span className="bg-green-600 text-white px-2 py-1 text-xs rounded">
                      GRÁTIS
                    </span>
                  )}
                </div>
                <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded">
                  {product.is_free ? 'Acessar' : 'Comprar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Ebook 1 */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="font-bold mb-2">Seu primeiro Ebook</h3>
        <button
          onClick={() => downloadEbook(data.token.purchase_id)}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          📥 Baixar Ebook LLM Local
        </button>
      </div>
    </div>
  )
}

async function downloadEbook(purchaseId) {
  // 1. Marca como downloaded
  await supabase
    .from('purchases')
    .update({ downloaded: true })
    .eq('id', purchaseId)

  // 2. Gera link de download (S3 signed URL)
  const signedUrl = await getSignedUrl(purchaseId)
  
  // 3. Abre download
  window.location.href = signedUrl
}
```
___
