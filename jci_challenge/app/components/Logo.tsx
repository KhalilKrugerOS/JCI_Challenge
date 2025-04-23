import { SquareDashedMousePointer } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

function Logo({
    fontSize = "text-2xl",
    iconSize = 20,
}: {
    fontSize?: string;
    iconSize?: number;
}) {
  return (
    <Link href = "/" className="text-2xl font-extrabold flex items-center gap-2">
        <div className="rounded-xl bg-gradient-to-r from-primary/70 to-primary p-2">
            <SquareDashedMousePointer size={iconSize}
                className='stroke-white'
            ></SquareDashedMousePointer>
        </div>
        <div>
            <span className="bg-gradient-to-r from-primary/70 to-primary bg-clip-text text-transparent">Study</span>
            <span className='text-stone-700 dark:text-stone-300'>Match</span>
        </div>
    </Link>
  )
}

export default Logo