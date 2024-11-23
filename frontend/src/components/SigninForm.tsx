'use client'

import { useState } from "react"
import { useFormState } from "react-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signIn } from "./actions"

export default function SignInForm() {
  const [state, formAction] = useFormState(signIn, null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <form action={formAction} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full">Sign In</Button>
      {state && <p className="text-sm text-red-500 mt-2">{state}</p>}
    </form>
  )
}

