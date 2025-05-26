'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, User, Compass } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { cn } from '@/lib/utils'

const defaultLinks = [
  { label: 'Feed', path: '/feed', icon: <Home className="h-4 w-4" /> },
  { label: 'Explore', path: '/explore', icon: <Compass className="h-4 w-4" /> },
  { label: 'Profile', path: '/profile', icon: <User className="h-4 w-4" /> },
]

export function AppHeader({
  links = defaultLinks,
}: {
  links?: { label: string; path: string; icon?: React.ReactNode }[]
}) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 px-4 py-3 transition-all duration-300 backdrop-blur-sm',
        scrolled ? 'bg-white/80 dark:bg-neutral-900/80 shadow-sm' : 'bg-white dark:bg-neutral-900',
      )}
    >
      <div className="mx-auto max-w-7xl flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link
            className="text-2xl font-bold hover:opacity-80 transition-opacity flex items-center select-none"
            href="/"
            title="О проекте SolX"
          >
            <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-transparent bg-clip-text">
              Sol
            </span>
            <span className="relative">
              <span className="text-black dark:text-white">X</span>
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
            </span>
          </Link>

          <nav className="hidden md:block">
            <ul className="flex gap-2 flex-nowrap items-center">
              {links.map(({ label, path, icon }) => (
                <li key={path}>
                  <Link
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-full transition-colors',
                      isActive(path)
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-medium'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    )}
                    href={path}
                  >
                    {icon}
                    <span>{label} </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <div className="hidden md:flex items-center gap-3">
          <WalletButton />
          <ClusterUiSelect />
          <ThemeSelect />
        </div>

        {showMenu && (
          <div className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md  z-40">
            <div className="flex flex-col p-4 gap-4 border-t dark:border-neutral-800 dark:bg-neutral-900">
              <ul className="flex flex-col gap-2">
                {links.map(({ label, path, icon }) => (
                  <li key={path}>
                    <Link
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors select-none',
                        isActive(path)
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-medium'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                      )}
                      href={path}
                      onClick={() => setShowMenu(false)}
                    >
                      {icon}
                      <span className="text-lg">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-4 mt-4 pt-4 border-t dark:border-neutral-800  ">
                <WalletButton />
                <ClusterUiSelect />
                <ThemeSelect />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
