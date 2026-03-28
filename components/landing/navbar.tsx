'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Preços', href: '#precos' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <Zap className="size-5 fill-green-500 text-green-500" />
          <span className="text-lg font-semibold text-zinc-900">LeadZap</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <Button
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
              render={<Link href="/pipeline" />}
            >
              Ir para o app
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Entrar
              </Button>
              <Button
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
                render={<Link href="/signup" />}
              >
                Começar grátis
              </Button>
            </>
          )}
        </div>

        {/* Mobile: CTA + Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            size="sm"
            className="bg-green-500 text-white hover:bg-green-600"
            render={<Link href={loggedIn ? '/pipeline' : '/signup'} />}
          >
            {loggedIn ? 'Ir para o app' : 'Começar grátis'}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Sheet menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 p-6">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex flex-col gap-6 pt-8">
            {navLinks.map((link) => (
              <SheetClose key={link.href} render={<a href={link.href} />}>
                <span className="text-base font-medium text-zinc-900">
                  {link.label}
                </span>
              </SheetClose>
            ))}
            <hr className="border-zinc-200" />
            {loggedIn ? (
              <Button
                className="bg-green-500 text-white hover:bg-green-600"
                render={<Link href="/pipeline" />}
                onClick={() => setMobileOpen(false)}
              >
                Ir para o app
              </Button>
            ) : (
              <>
                <SheetClose render={<Link href="/login" />}>
                  <span className="text-base font-medium text-zinc-600">
                    Entrar
                  </span>
                </SheetClose>
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  render={<Link href="/signup" />}
                  onClick={() => setMobileOpen(false)}
                >
                  Começar grátis
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
