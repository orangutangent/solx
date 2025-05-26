import React from 'react'

export function AppFooter() {
  return (
    <footer className="text-center p-4 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 text-xs">
      github{' '}
      <a
        className="link hover:text-neutral-500 dark:hover:text-white"
        href="https://github.com/orangutangent"
        target="_blank"
        rel="noopener noreferrer"
      >
        orangutangent
      </a>
    </footer>
  )
}
