'use client'

import { useState } from "react"
import { useFormState } from "react-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signUp } from "./actions"

export default function SignUpForm() {
  const [state, formAction] = useFormState(signUp, null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  return (
    <form action={formAction} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />
      </div>
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
      <Button type="submit" className="w-full">Sign Up</Button>
      {state && <p className="text-sm text-red-500 mt-2">{state}</p>}
    </form>
  )
}

