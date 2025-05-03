import { Button } from '~/components/ui/button'
import React from 'react'

const CreateAdmin = () => {
  async function onSubmit() {
    const { authClient } = await import("~/libs/auth-client")
    await authClient.signUp.email({
      email: 'admin3@servemed.co',
      name: 'Admin3',
      password: 'password3',
      username: 'admin3'
    })
  }

  return (
    <div>
      <Button onClick={() => onSubmit()} className="w-full">
        Create Admin
      </Button>
    </div>
  )
}

export default CreateAdmin
