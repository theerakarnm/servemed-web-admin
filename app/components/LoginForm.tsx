import { cn, jnavigate } from "~/libs/utils"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { InputPure as Input } from "~/components/ui/inputWithOutForm"
import { Label } from "~/components/ui/label"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"
import { authClient } from "~/libs/auth-client"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  function handleChange(
    key: keyof typeof form,
    value: string
  ) {
    setForm({
      ...form,
      [key]: value
    })
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    await authClient.signIn.email({
      ...form,
      fetchOptions: {
        onError: () => {
          toast('เกิดข้อผิดพลาด')
        },
        onSuccess: () => {
          jnavigate({
            path: '/dashboard',
          })
        }
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form onSubmit={onSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-[22rem] h-32">
                  <img src="/ServeMedLogo.avif" alt="ServeMedLogo" />
                </div>
                <h1 className="text-2xl font-bold mt-4">
                  ลงชื่อเข้าใช้ ServeMed Admin Portal
                </h1>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" type="email" placeholder="กรอกอีเมล" required
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  {/* <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Forgot your password?
                  </a> */}
                </div>
                <Input id="password" type="password" required
                  value={form.password}
                  placeholder="กรอกรหัสผ่าน"
                  onChange={(e) => handleChange('password', e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

