'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function signIn() {
    await supabase.auth.signInWithPassword({ email, password })
    window.location.href = '/dashboard'
  }

  async function signUp() {
    await supabase.auth.signUp({ email, password })
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>MVP 1.3 Login</h1>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="password" type="password" onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={signIn}>Login</button>
      <button onClick={signUp}>Sign up</button>
    </div>
  )
}
