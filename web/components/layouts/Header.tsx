import React from 'react'
import { Button } from '../ui/button'

export default function Header() {
  return (
    <div className="w-full h-20 flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 ">
        {/* LOGO */}
        <div className="text-2xl">LOGO</div>  

        {/* BLANK */}
        <div className="w-1/3"></div>

        {/* NAV */}
        <div className="flex items-center gap-4"> 
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Contact</Button>
        </div>


        {/* ACTIONS */}
        <div className="flex items-center gap-4">
            <Button variant="ghost">Login</Button>
            <Button>Sign Up</Button>
        </div>
    </div>
  )
}
